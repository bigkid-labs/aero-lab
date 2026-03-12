use axum::{middleware, routing::{get, post}, Router};
use sqlx::PgPool;

use crate::middleware::auth::require_auth;
use super::handlers::{create_session, get_session, list_sessions};

pub fn router(pool: PgPool, jwt_secret: String) -> Router {
    // Protected: POST / and GET / require valid JWT
    let protected = Router::new()
        .route("/", post(create_session).get(list_sessions))
        .route_layer(middleware::from_fn_with_state(
            jwt_secret,
            require_auth,
        ))
        .with_state(pool.clone());

    // Public: GET /:id (race plans are shareable; ownership is checked inside the handler)
    let public = Router::new()
        .route("/:id", get(get_session))
        .with_state(pool);

    Router::new().merge(protected).merge(public)
}
