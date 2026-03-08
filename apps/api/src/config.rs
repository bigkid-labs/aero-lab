use std::env;
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub bind_addr: String,
    pub minio_endpoint: String,
    pub minio_access_key: String,
    pub minio_secret_key: String,
    pub minio_bucket: String,
    pub telegram_bot_token: String,
    /// Telegram chat ID where consultation alerts are sent (group or user)
    pub telegram_chat_id: i64,
}

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Missing required environment variable: {0}")]
    Missing(String),
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Ok(Self {
            database_url: require("DATABASE_URL")?,
            bind_addr: env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string()),
            minio_endpoint: require("MINIO_ENDPOINT")?,
            minio_access_key: require("MINIO_ACCESS_KEY")?,
            minio_secret_key: require("MINIO_SECRET_KEY")?,
            minio_bucket: require("MINIO_BUCKET")?,
            telegram_bot_token: require("TELEGRAM_BOT_TOKEN")?,
            telegram_chat_id: env::var("TELEGRAM_CHAT_ID")
                .map_err(|_| ConfigError::Missing("TELEGRAM_CHAT_ID".into()))?
                .parse::<i64>()
                .map_err(|_| ConfigError::Missing("TELEGRAM_CHAT_ID (must be integer)".into()))?,
        })
    }
}

fn require(key: &str) -> Result<String, ConfigError> {
    env::var(key).map_err(|_| ConfigError::Missing(key.to_string()))
}
