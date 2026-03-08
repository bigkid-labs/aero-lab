use axum::{routing::post, Router};
use sqlx::PgPool;

use crate::config::Config;

use super::handlers;

pub fn router(pool: PgPool, config: Config) -> Router {
    Router::new()
        .route("/", post(handlers::create_consultation))
        .with_state((pool, config))
}
