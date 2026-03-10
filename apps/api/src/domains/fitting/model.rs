use serde::{Deserialize, Serialize};

/// Rider geometry input — submitted via the fit tool form.
#[derive(Debug, Deserialize)]
pub struct FitRequest {
    pub full_name:        String,
    pub email:            Option<String>,
    /// Torso length in mm (nape-of-neck to top of pelvis, sitting upright)
    pub torso_mm:         f64,
    /// Full arm length in mm (shoulder to wrist, arm straight)
    pub arm_mm:           f64,
    /// Inseam in mm (floor to crotch, inner leg)
    pub inseam_mm:        f64,
    /// Flexibility index: 1 (very rigid) to 5 (very flexible).
    /// Controls the biomechanical safety offset for restricted riders.
    pub flexibility:      i16,
    /// Desired position aggression: 1 (comfort/endurance) to 5 (maximum UCI-limit aero).
    /// Decoupled from flexibility — a stiff rider can still target an aggressive position,
    /// though the safety penalty will constrain the ideal geometry accordingly.
    pub aggression_level: i16,
    /// Slug of the product to fit against
    pub product_slug:     String,
}

/// Single spec delta — shown to the rider as an actionable adjustment.
#[derive(Debug, Serialize)]
pub struct FitAdjustment {
    pub spec:       String,
    pub current_mm: f64,
    pub ideal_mm:   f64,
    pub delta_mm:   f64,
    pub note:       String,
}

/// Biomechanical risk classification.
#[derive(Debug, Serialize)]
pub enum RiskLevel {
    Low,
    Moderate,
    High,
}

/// Full fit analysis result returned to the client.
#[derive(Debug, Serialize)]
pub struct FitAnalysis {
    /// 0.0–10.0
    pub fit_score:       f64,
    pub verdict:         String,
    pub recommendation:  String,
    pub adjustments:     Vec<FitAdjustment>,
    /// Biomechanical risk: Low | Moderate | High
    pub risk_assessment: RiskLevel,
    /// True when risk is High — frontend should escalate to specialist CTA
    pub specialist_cta:  bool,
}
