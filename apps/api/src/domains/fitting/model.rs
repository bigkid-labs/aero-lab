use serde::{Deserialize, Serialize};

/// Rider geometry input — submitted via the fit tool form.
#[derive(Debug, Deserialize)]
pub struct FitRequest {
    pub full_name: String,
    pub email: Option<String>,
    pub torso_mm: f64,
    pub arm_mm: f64,
    pub inseam_mm: f64,
    /// Flexibility index 1 (rigid) to 5 (highly flexible)
    pub flexibility: i16,
    /// Slug of the product to fit against
    pub product_slug: String,
}

/// Single spec delta — shown to the rider as an actionable adjustment.
#[derive(Debug, Serialize)]
pub struct FitAdjustment {
    pub spec: String,
    pub current_mm: f64,
    pub ideal_mm: f64,
    pub delta_mm: f64,
    pub note: String,
}

/// Full fit analysis result returned to the client.
#[derive(Debug, Serialize)]
pub struct FitAnalysis {
    /// 0.0–10.0
    pub fit_score: f64,
    pub verdict: String,
    pub recommendation: String,
    pub adjustments: Vec<FitAdjustment>,
}
