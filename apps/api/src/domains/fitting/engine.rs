use crate::domains::products::model::ProductGeometry;

use super::model::{FitAdjustment, FitAnalysis, FitRequest, RiskLevel};

// ─── Scoring Tolerances ───────────────────────────────────────────────────────

/// Scoring tolerance per spec (mm). Fits within tolerance → full score.
const TOLERANCE_REACH: f64 = 15.0;
const TOLERANCE_STACK: f64 = 20.0;
const TOLERANCE_DROP:  f64 = 10.0;

/// High-risk delta threshold (mm). Any spec exceeding this triggers High risk.
const HIGH_RISK_DELTA_MM: f64 = 20.0;
/// Moderate-risk delta threshold (mm).
const MODERATE_RISK_DELTA_MM: f64 = 10.0;

// ─── Flexibility Penalty Table ────────────────────────────────────────────────

/// Biomechanical safety offsets indexed by flexibility score (1–5).
///
/// Applied when a rider has restricted range of motion to prevent the engine
/// from prescribing a position they cannot safely hold.
///
/// Layout: (flexibility_score, reach_offset_mm)
/// - reach_offset_mm: subtracted from ideal_reach (negative = reduce reach demand)
/// - stack and drop offsets are derived proportionally inside apply_penalty()
///
/// Values here are the single source of truth — change them here to retune.
const FLEXIBILITY_PENALTY_TABLE: [(i16, f64); 5] = [
    (1, -30.0), // Rigid: high risk — reduce reach demand 30mm, raise stack, reduce drop
    (2, -15.0), // Stiff: moderate — reduce reach demand 15mm
    (3,   0.0), // Average: no adjustment
    (4,   0.0), // Flexible: no adjustment
    (5,   0.0), // Very flexible: no adjustment
];

fn get_reach_penalty(flexibility: i16) -> f64 {
    FLEXIBILITY_PENALTY_TABLE
        .iter()
        .find(|(k, _)| *k == flexibility)
        .map(|(_, v)| *v)
        .unwrap_or(0.0)
}

/// Apply flexibility penalty to the three ideal geometry coordinates.
///
/// Stack and drop offsets are derived from the reach penalty:
///   stack_offset = |reach_offset| × 0.6  (raise front end)
///   drop_offset  = |reach_offset| × 0.3  (reduce pad drop)
fn apply_penalty(
    flexibility: i16,
    ideal_reach: f64,
    ideal_stack: f64,
    ideal_drop:  f64,
) -> (f64, f64, f64) {
    let reach_offset = get_reach_penalty(flexibility);
    let abs_offset   = reach_offset.abs();
    (
        ideal_reach + reach_offset,
        ideal_stack + abs_offset * 0.6,  // raise stack (easier to hold)
        ideal_drop  - abs_offset * 0.3,  // reduce drop (less aggressive)
    )
}

// ─── Risk Assessment ──────────────────────────────────────────────────────────

fn assess_risk(flexibility: i16, max_abs_delta: f64) -> RiskLevel {
    if flexibility == 1 || max_abs_delta > HIGH_RISK_DELTA_MM {
        RiskLevel::High
    } else if flexibility == 2 || max_abs_delta > MODERATE_RISK_DELTA_MM {
        RiskLevel::Moderate
    } else {
        RiskLevel::Low
    }
}

// ─── Core Engine ──────────────────────────────────────────────────────────────

/// Core fit analysis engine.
///
/// 1. Derives ideal geometry from rider biometrics + aggression_level.
/// 2. Applies flexibility safety penalty for restricted riders (flexibility ≤ 2).
/// 3. Scores each product spec against the adjusted ideals.
/// 4. Classifies biomechanical risk based on deltas and flexibility.
pub fn analyze(rider: &FitRequest, geometries: &[ProductGeometry]) -> FitAnalysis {
    // Validate: reject obviously bad measurements before computing
    if rider.torso_mm <= 0.0 || rider.arm_mm <= 0.0 || rider.inseam_mm <= 0.0 {
        return FitAnalysis {
            fit_score:       0.0,
            verdict:         "INVALID INPUT".to_string(),
            recommendation:  "Body measurements must be positive values in millimetres.".to_string(),
            adjustments:     Vec::new(),
            risk_assessment: RiskLevel::High,
            specialist_cta:  true,
        };
    }

    // ── Derive ideal geometry from aggression_level (decoupled from flexibility) ──
    //
    // aggression: 0.0 (comfort) → 1.0 (maximum UCI-limit aero)
    let aggression = (rider.aggression_level.clamp(1, 5) as f64 - 1.0) / 4.0;

    let raw_reach = rider.arm_mm    * 0.92 + aggression * 10.0;
    let raw_stack = rider.torso_mm  * 0.62 - aggression * 25.0;
    let raw_drop  = rider.inseam_mm * 0.05 + aggression * 20.0;

    // ── Apply flexibility safety penalty (constraint logic) ────────────────────
    let (ideal_reach, ideal_stack, ideal_drop) =
        apply_penalty(rider.flexibility, raw_reach, raw_stack, raw_drop);

    // ── Score each geometry spec ───────────────────────────────────────────────
    let mut score_total  = 0.0;
    let mut score_count  = 0usize;
    let mut max_abs_delta = 0.0_f64;
    let mut adjustments: Vec<FitAdjustment> = Vec::new();

    for geo in geometries {
        let (ideal, tolerance) = match geo.spec_key.as_str() {
            "reach" => (ideal_reach, TOLERANCE_REACH),
            "stack" => (ideal_stack, TOLERANCE_STACK),
            "drop"  => (ideal_drop,  TOLERANCE_DROP),
            _       => continue, // non-geometry specs (weight, material, etc.)
        };

        let delta     = geo.spec_value - ideal;
        let abs_delta = delta.abs();

        max_abs_delta = max_abs_delta.max(abs_delta);

        // Linear score: full marks within tolerance, zero at 2× tolerance
        let spec_score = ((2.0 * tolerance - abs_delta.min(2.0 * tolerance))
            / (2.0 * tolerance))
            * 10.0;

        score_total += spec_score;
        score_count += 1;

        // Surface adjustments that meaningfully affect fit
        if abs_delta > tolerance * 0.4 {
            let direction = if delta > 0.0 { "above" } else { "below" };
            let action = match (geo.spec_key.as_str(), delta > 0.0) {
                ("reach", true)  => "consider a shorter stem",
                ("reach", false) => "consider a longer stem or extensions",
                ("stack", true)  => "remove spacers or use a lower-rise stem",
                ("stack", false) => "add spacers or raise stem",
                ("drop",  true)  => "lower the pads or adjust base bar",
                ("drop",  false) => "raise the pads",
                _                => "consult your fitter",
            };
            adjustments.push(FitAdjustment {
                spec:       geo.spec_key.clone(),
                current_mm: geo.spec_value,
                ideal_mm:   (ideal * 10.0).round() / 10.0,
                delta_mm:   (delta * 10.0).round() / 10.0,
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

    let risk_assessment = assess_risk(rider.flexibility, max_abs_delta);
    let specialist_cta  = matches!(risk_assessment, RiskLevel::High);

    let (verdict, recommendation) = score_to_verdict(fit_score, &risk_assessment);

    FitAnalysis {
        fit_score,
        verdict: verdict.to_string(),
        recommendation: recommendation.to_string(),
        adjustments,
        risk_assessment,
        specialist_cta,
    }
}

// ─── Verdict Lookup ───────────────────────────────────────────────────────────

fn score_to_verdict(score: f64, risk: &RiskLevel) -> (&'static str, &'static str) {
    // High-risk overrides the score verdict regardless of fit score
    if matches!(risk, RiskLevel::High) {
        return (
            "HIGH RISK",
            "One or more geometry dimensions fall significantly outside your ideal range, \
             or your flexibility restricts safe adoption of this position. \
             Do not order without consulting a BIGKID specialist first.",
        );
    }

    match score as u8 {
        9..=10 => (
            "OPTIMAL",
            "This product is an excellent match for your geometry. \
             No significant adjustments needed — ride fast.",
        ),
        7..=8 => (
            "GOOD FIT",
            "Strong compatibility. Minor fine-tuning may further optimise your aero position.",
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
