use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, FromRow)]
pub struct Product {
    pub id: Uuid,
    pub slug: String,
    pub name: String,
    pub category: String,
    pub description: Option<String>,
    pub price_vnd: Option<i64>,
    pub model_key: Option<String>,
    pub thumbnail_key: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Geometry spec row — spec_value cast to FLOAT8 in SQL to avoid NUMERIC<->Rust friction.
#[derive(Debug, Serialize, FromRow)]
pub struct ProductGeometry {
    pub spec_key: String,
    pub spec_value: f64,
    pub unit: String,
}

/// Full product payload returned on detail endpoint.
#[derive(Debug, Serialize)]
pub struct ProductDetail {
    #[serde(flatten)]
    pub product: Product,
    pub geometries: Vec<ProductGeometry>,
}
