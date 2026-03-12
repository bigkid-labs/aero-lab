use axum::{
    body::Body,
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use serde_json::json;

#[derive(Debug, Deserialize)]
struct SupabaseClaims {
    sub: String,
    email: Option<String>,
}

/// Injected into request extensions by `require_auth` middleware.
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: String,
    pub email:   Option<String>,
}

/// Axum middleware layer — validates Supabase HS256 JWT.
/// Apply via: `route(...).layer(axum::middleware::from_fn_with_state(secret, require_auth))`
pub async fn require_auth(
    axum::extract::State(secret): axum::extract::State<String>,
    mut req: Request<Body>,
    next: Next,
) -> Response {
    match extract_bearer(req.headers()).and_then(|t| validate(&t, &secret).ok()) {
        Some(user) => {
            req.extensions_mut().insert(user);
            next.run(req).await
        }
        None => (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Missing or invalid authorization token" })),
        )
            .into_response(),
    }
}

fn extract_bearer(headers: &HeaderMap) -> Option<String> {
    headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|s| s.to_owned())
}

fn validate(token: &str, secret: &str) -> Result<AuthUser, jsonwebtoken::errors::Error> {
    let mut val = Validation::new(Algorithm::HS256);
    val.set_audience(&["authenticated"]);
    let data = decode::<SupabaseClaims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &val,
    )?;
    Ok(AuthUser {
        user_id: data.claims.sub,
        email:   data.claims.email,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_missing_bearer() {
        let headers = HeaderMap::new();
        assert!(extract_bearer(&headers).is_none());
    }

    #[test]
    fn rejects_malformed_token() {
        assert!(validate("not.a.jwt", "any-secret").is_err());
    }

    #[test]
    fn rejects_wrong_secret() {
        // a well-formed JWT but signed with a different secret
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\
                     eyJzdWIiOiJ1c2VyLTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjo5OTk5OTk5OTk5fQ.\
                     bad_signature";
        assert!(validate(token, "wrong-secret").is_err());
    }
}
