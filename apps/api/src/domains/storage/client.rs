use std::{sync::Arc, time::Duration};

use anyhow::Context;
use axum::http::Method;
use object_store::{aws::AmazonS3Builder, path::Path, signer::Signer};

use crate::config::Config;


/// Concrete MinIO client — kept as AmazonS3 so Signer is available without downcast.
pub type MinioStore = Arc<object_store::aws::AmazonS3>;

/// Build an S3-compatible AmazonS3 client pointed at MinIO.
pub fn build_store(config: &Config) -> anyhow::Result<MinioStore> {
    let store = AmazonS3Builder::new()
        .with_endpoint(&config.minio_endpoint)
        .with_access_key_id(&config.minio_access_key)
        .with_secret_access_key(&config.minio_secret_key)
        .with_bucket_name(&config.minio_bucket)
        .with_allow_http(true) // allow plain HTTP for local MinIO
        .build()
        .context("Failed to build MinIO S3 client")?;

    Ok(Arc::new(store))
}

/// Generate a time-limited presigned GET URL for an asset key.
pub async fn presigned_get_url(
    store: &object_store::aws::AmazonS3,
    key: &str,
    expires_in: Duration,
) -> anyhow::Result<url::Url> {
    let path = Path::from(key);
    let signed = store
        .signed_url(Method::GET, &path, expires_in)
        .await
        .context("Failed to generate presigned URL")?;

    Ok(signed)
}
