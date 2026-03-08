use axum::{routing::get, Router};
use sqlx::PgPool;

use super::handlers;

pub fn router(pool: PgPool) -> Router {
    Router::new()
        .route("/", get(handlers::list_products))
        .route("/categories", get(handlers::list_categories))
        .route("/:slug", get(handlers::get_product))
        .with_state(pool)
}
