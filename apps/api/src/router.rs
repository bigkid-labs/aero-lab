use axum::{routing::get, Json, Router};
use serde_json::{json, Value};
use sqlx::PgPool;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::config::Config;
use crate::domains::{consultation, fitting, products, sessions, storage};

pub fn create_router(pool: PgPool, config: Config) -> anyhow::Result<Router> {
    let store = storage::client::build_store(&config)?;

    let router = Router::new()
        .route("/health", get(health_check))
        .nest("/api/v1/products",      products::router::router(pool.clone()))
        .nest("/api/v1/fitting",       fitting::router::router(pool.clone()))
        .nest("/api/v1/consultations", consultation::router::router(pool.clone(), config.clone()))
        .nest("/api/v1/sessions",      sessions::router::router(pool.clone(), config.supabase_jwt_secret.clone()))
        .nest("/api/v1/storage",       storage::router::router(store))
        .layer(CorsLayer::permissive()) // Restrict origins in production
        .layer(TraceLayer::new_for_http());

    Ok(router)
}

async fn health_check() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "bigkid-api" }))
}
