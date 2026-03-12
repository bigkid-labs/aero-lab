use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct RiderSession {
    pub id:           Uuid,
    pub rider_id:     Uuid,
    pub session_type: String,
    pub payload:      Value,
    pub created_at:   DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSession {
    pub session_type: String,
    pub payload:      Value,
}
