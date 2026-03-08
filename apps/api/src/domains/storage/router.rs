use axum::{routing::get, Router};

use super::{client::MinioStore, handlers};

pub fn router(store: MinioStore) -> Router {
    Router::new()
        .route("/presigned", get(handlers::presigned_get))
        .with_state(store)
}
