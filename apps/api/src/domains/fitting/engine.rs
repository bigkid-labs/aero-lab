use crate::domains::products::model::ProductGeometry;

use super::model::{FitAdjustment, FitAnalysis, FitRequest};

/// Scoring tolerance per spec (mm). Fits within tolerance → full score.
const TOLERANCE_REACH: f64 = 15.0;
const TOLERANCE_STACK: f64 = 20.0;
const TOLERANCE_DROP: f64 = 10.0;

/// Core fit analysis engine.
///
/// Calculates ideal geometry values from rider biometrics and scores
/// each product spec against those ideals. Returns an actionable FitAnalysis.
pub fn analyze(rider: &FitRequest, geometries: &[ProductGeometry]) -> FitAnalysis {
    // ── Derive ideal geometry from rider biometrics ────────────────────────
    //
    // These are simplified TT fitting formulas. In production, replace with
    // a certified fitting protocol (e.g. Retul, Guru) or ML model.
    //
    // flexibility: 1 = rigid position, 5 = very aggressive aero tuck
    let aggression = (rider.flexibility as f64 - 1.0) / 4.0; // 0.0–1.0

    let ideal_reach = rider.arm_mm * 0.92 + aggression * 10.0;
    let ideal_stack = rider.torso_mm * 0.62 - aggression * 25.0;
    let ideal_drop  = rider.inseam_mm * 0.05 + aggression * 20.0;

    // ── Score each geometry spec ───────────────────────────────────────────
    let mut score_total = 0.0;
    let mut score_count = 0usize;
    let mut adjustments: Vec<FitAdjustment> = Vec::new();

    for geo in geometries {
        let (ideal, tolerance) = match geo.spec_key.as_str() {
            "reach" => (ideal_reach, TOLERANCE_REACH),
            "stack" => (ideal_stack, TOLERANCE_STACK),
            "drop"  => (ideal_drop,  TOLERANCE_DROP),
            _       => continue, // non-geometry specs (weight, material, etc.)
        };

        let delta = geo.spec_value - ideal;
        let abs_delta = delta.abs();

        // Linear score: full marks within tolerance, zero at 2× tolerance
        let spec_score = ((2.0 * tolerance - abs_delta.min(2.0 * tolerance))
            / (2.0 * tolerance))
            * 10.0;

        score_total += spec_score;
        score_count += 1;

        // Only surface adjustments that meaningfully affect fit
        if abs_delta > tolerance * 0.4 {
            let direction = if delta > 0.0 { "above" } else { "below" };
            let action = match (geo.spec_key.as_str(), delta > 0.0) {
                ("reach", true)  => "consider a shorter stem",
                ("reach", false) => "consider a longer stem or extensions",
                ("stack", true)  => "remove spacers or use a lower-rise stem",
                ("stack", false) => "add spacers or raise stem",
                ("drop", true)   => "lower the pads or adjust base bar",
                ("drop", false)  => "raise the pads",
                _                => "consult your fitter",
            };
            adjustments.push(FitAdjustment {
                spec: geo.spec_key.clone(),
                current_mm: geo.spec_value,
                ideal_mm: (ideal * 10.0).round() / 10.0,
                delta_mm: (delta * 10.0).round() / 10.0,
                note: format!(
                    "{} is {:.0}mm {} ideal — {}",
                    geo.spec_key, abs_delta, direction, action
                ),
            });
        }
    }

    let fit_score = if score_count > 0 {
        (score_total / score_count as f64 * 10.0).round() / 10.0
    } else {
        5.0
    };

    let (verdict, recommendation) = score_to_verdict(fit_score);

    FitAnalysis {
        fit_score,
        verdict: verdict.to_string(),
        recommendation: recommendation.to_string(),
        adjustments,
    }
}

fn score_to_verdict(score: f64) -> (&'static str, &'static str) {
    match score as u8 {
        9..=10 => (
            "OPTIMAL",
            "This product is an excellent match for your geometry. \
             No significant adjustments needed — ride fast.",
        ),
        7..=8 => (
            "GOOD FIT",
            "Strong compatibility. Minor fine-tuning may optimize your aero position.",
        ),
        5..=6 => (
            "MARGINAL",
            "Workable, but adjustments are required. \
             A consultation will ensure you get the most from this product.",
        ),
        _ => (
            "POOR FIT",
            "This product is likely outside your geometry range. \
             We strongly recommend requesting a consultation before ordering.",
        ),
    }
}
