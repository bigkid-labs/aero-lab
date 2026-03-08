use axum::{extract::State, Json};
use sqlx::PgPool;

use crate::{
    domains::products::repository,
    error::AppResult,
};

use super::{engine, model::{FitAnalysis, FitRequest}};

/// POST /api/v1/fitting/analyze
///
/// Accepts rider biometrics + a product slug, runs the fit engine,
/// and returns an actionable FitAnalysis. Does not require authentication.
pub async fn analyze_fit(
    State(pool): State<PgPool>,
    Json(body): Json<FitRequest>,
) -> AppResult<Json<FitAnalysis>> {
    // Load the target product's geometry specs
    let detail = repository::get_product_by_slug(&pool, &body.product_slug).await?;

    let analysis = engine::analyze(&body, &detail.geometries);

    Ok(Json(analysis))
}
