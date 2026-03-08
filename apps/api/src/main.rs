mod config;
mod domains;
mod error;
mod middleware;
mod router;

use config::Config;
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    dotenvy::dotenv().ok();

    let config = Config::from_env()?;

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    let app = router::create_router(pool, config.clone())?;

    let listener = tokio::net::TcpListener::bind(&config.bind_addr).await?;
    tracing::info!("BIGKID API listening on {}", config.bind_addr);

    axum::serve(listener, app).await?;

    Ok(())
}
