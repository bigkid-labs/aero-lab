use axum::{routing::post, Router};
use sqlx::PgPool;

use super::handlers;

pub fn router(pool: PgPool) -> Router {
    Router::new()
        .route("/analyze", post(handlers::analyze_fit))
        .with_state(pool)
}
