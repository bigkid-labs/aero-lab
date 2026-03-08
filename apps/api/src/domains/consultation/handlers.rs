use axum::{extract::State, http::StatusCode, Json};
use sqlx::PgPool;

use crate::{
    config::Config,
    domains::products::repository as product_repo,
    error::AppResult,
};

use super::{
    model::{ConsultationCreated, ConsultationRequest},
    repository, telegram,
};

/// POST /api/v1/consultations
pub async fn create_consultation(
    State((pool, config)): State<(PgPool, Config)>,
    Json(body): Json<ConsultationRequest>,
) -> AppResult<(StatusCode, Json<ConsultationCreated>)> {
    // Resolve product if slug provided
    let (product_id, product_name) = match &body.product_slug {
        Some(slug) => {
            let detail = product_repo::get_product_by_slug(&pool, slug).await?;
            (Some(detail.product.id), Some(detail.product.name.clone()))
        }
        None => (None, None),
    };

    let consultation_id =
        repository::create_consultation(&pool, &body, product_id).await?;

    let id_str = consultation_id.to_string();

    // Fire Telegram alert in background — non-blocking
    tokio::spawn(telegram::send_alert(
        config.telegram_bot_token.clone(),
        config.telegram_chat_id,
        body,
        id_str.clone(),
        product_name,
    ));

    Ok((
        StatusCode::CREATED,
        Json(ConsultationCreated {
            id: id_str,
            message: "Your request has been received. We'll be in touch shortly.".to_string(),
        }),
    ))
}
