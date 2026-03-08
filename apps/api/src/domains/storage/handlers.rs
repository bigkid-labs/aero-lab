use std::time::Duration;

use axum::{
    extract::{Query, State},
    Json,
};
use serde::{Deserialize, Serialize};

use crate::error::{AppError, AppResult};

use super::client::{presigned_get_url, MinioStore};

#[derive(Deserialize)]
pub struct PresignedParams {
    pub key: String,
}

#[derive(Serialize)]
pub struct PresignedResponse {
    pub url: String,
    pub expires_in_secs: u64,
}

const PRESIGNED_TTL: Duration = Duration::from_secs(3600); // 1 hour

/// GET /api/v1/storage/presigned?key=products/some-id/model.glb
pub async fn presigned_get(
    State(store): State<MinioStore>,
    Query(params): Query<PresignedParams>,
) -> AppResult<Json<PresignedResponse>> {
    if params.key.is_empty() {
        return Err(AppError::BadRequest("key must not be empty".into()));
    }

    let url = presigned_get_url(store.as_ref(), &params.key, PRESIGNED_TTL)
        .await
        .map_err(|e| {
            tracing::error!("Presigned URL generation failed: {e}");
            AppError::Internal(e)
        })?;

    Ok(Json(PresignedResponse {
        url: url.to_string(),
        expires_in_secs: PRESIGNED_TTL.as_secs(),
    }))
}
