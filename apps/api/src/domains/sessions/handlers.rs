use axum::{
    extract::{Path, Query, Request, State},
    http::StatusCode,
    Extension, Json,
};
use serde::Deserialize;
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use super::model::{CreateSession, RiderSession};

#[derive(Deserialize)]
pub struct Pagination {
    #[serde(default = "default_limit")]
    pub limit: i64,
    #[serde(default)]
    pub offset: i64,
}
fn default_limit() -> i64 { 10 }

/// POST /api/v1/sessions — save a tool result (auth required)
pub async fn create_session(
    State(pool): State<PgPool>,
    Extension(user): Extension<AuthUser>,
    Json(body): Json<CreateSession>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    let valid = ["fit", "aero", "race_plan", "comparison"];
    if !valid.contains(&body.session_type.as_str()) {
        return Err(AppError::BadRequest("Invalid session_type".into()));
    }

    // Upsert rider by supabase_user_id, update last_active_at on conflict
    let rider_id: Uuid = sqlx::query_scalar(
        "INSERT INTO riders (id, supabase_user_id, full_name)
         VALUES ($1, $2::uuid, 'Rider')
         ON CONFLICT (supabase_user_id) DO UPDATE SET last_active_at = NOW()
         RETURNING id"
    )
    .bind(Uuid::now_v7())
    .bind(&user.user_id)
    .fetch_one(&pool)
    .await?;

    let id = Uuid::now_v7();
    sqlx::query(
        "INSERT INTO rider_sessions (id, rider_id, session_type, payload)
         VALUES ($1, $2, $3, $4)"
    )
    .bind(id)
    .bind(rider_id)
    .bind(&body.session_type)
    .bind(&body.payload)
    .execute(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(json!({ "id": id }))))
}

/// GET /api/v1/sessions — list rider's sessions (auth required)
pub async fn list_sessions(
    State(pool): State<PgPool>,
    Extension(user): Extension<AuthUser>,
    Query(page): Query<Pagination>,
) -> Result<Json<Vec<RiderSession>>, AppError> {
    let sessions = sqlx::query_as::<_, RiderSession>(
        "SELECT rs.* FROM rider_sessions rs
         JOIN riders r ON r.id = rs.rider_id
         WHERE r.supabase_user_id = $1::uuid
         ORDER BY rs.created_at DESC
         LIMIT $2 OFFSET $3"
    )
    .bind(&user.user_id)
    .bind(page.limit)
    .bind(page.offset)
    .fetch_all(&pool)
    .await?;

    Ok(Json(sessions))
}

/// GET /api/v1/sessions/:id — public for race_plan, owner-only for others.
/// Uses the raw Request to optionally extract AuthUser — safe on public routes
/// where no auth middleware has run and the extension is absent.
pub async fn get_session(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    req: Request,
) -> Result<Json<RiderSession>, AppError> {
    // Safely pull an optional AuthUser from extensions without panicking
    // when the auth middleware has not run (public route).
    let user: Option<AuthUser> = req.extensions().get::<AuthUser>().cloned();

    let session = sqlx::query_as::<_, RiderSession>(
        "SELECT * FROM rider_sessions WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Session not found".into()))?;

    if session.session_type != "race_plan" {
        let uid = user.as_ref().map(|u| u.user_id.as_str()).unwrap_or("");
        let owner: Option<String> = sqlx::query_scalar(
            "SELECT supabase_user_id::text FROM riders WHERE id = $1"
        )
        .bind(session.rider_id)
        .fetch_optional(&pool)
        .await?
        .flatten();
        if owner.as_deref() != Some(uid) {
            return Err(AppError::Forbidden("Access denied".into()));
        }
    }

    Ok(Json(session))
}
