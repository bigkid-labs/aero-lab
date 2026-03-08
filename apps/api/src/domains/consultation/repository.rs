use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppResult;

use super::model::ConsultationRequest;

/// Create a rider record (or find existing by email), then create a consultation.
/// Returns the new consultation UUID.
pub async fn create_consultation(
    pool: &PgPool,
    req: &ConsultationRequest,
    product_id: Option<Uuid>,
) -> AppResult<Uuid> {
    // Upsert rider — match on email if provided, otherwise always insert
    let rider_id: Uuid = match &req.email {
        Some(email) => {
            sqlx::query_scalar::<_, Uuid>(
                "INSERT INTO riders (id, full_name, email, phone)
                 VALUES (gen_random_uuid(), $1, $2, $3)
                 ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
                 RETURNING id",
            )
            .bind(&req.full_name)
            .bind(email)
            .bind(&req.phone)
            .fetch_one(pool)
            .await?
        }
        None => {
            sqlx::query_scalar::<_, Uuid>(
                "INSERT INTO riders (id, full_name, phone)
                 VALUES (gen_random_uuid(), $1, $2)
                 RETURNING id",
            )
            .bind(&req.full_name)
            .bind(&req.phone)
            .fetch_one(pool)
            .await?
        }
    };

    // Create consultation record
    let consultation_id = sqlx::query_scalar::<_, Uuid>(
        "INSERT INTO consultations (id, rider_id, product_id, message)
         VALUES (gen_random_uuid(), $1, $2, $3)
         RETURNING id",
    )
    .bind(rider_id)
    .bind(product_id)
    .bind(&req.message)
    .fetch_one(pool)
    .await?;

    Ok(consultation_id)
}
