use serde::{Deserialize, Serialize};

/// Incoming consultation request from the website form.
#[derive(Debug, Deserialize)]
pub struct ConsultationRequest {
    pub full_name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    /// Optional product slug the rider is enquiring about
    pub product_slug: Option<String>,
    pub message: Option<String>,
}

/// API response after a consultation is created.
#[derive(Debug, Serialize)]
pub struct ConsultationCreated {
    pub id: String,
    pub message: String,
}
