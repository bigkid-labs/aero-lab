use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use sqlx::PgPool;

use crate::error::AppResult;

use super::{
    model::{Product, ProductDetail},
    repository,
};

#[derive(Deserialize)]
pub struct ListParams {
    pub category: Option<String>,
}

/// GET /api/v1/products
pub async fn list_products(
    State(pool): State<PgPool>,
    Query(params): Query<ListParams>,
) -> AppResult<Json<Vec<Product>>> {
    let products = repository::list_products(&pool, params.category.as_deref()).await?;
    Ok(Json(products))
}

/// GET /api/v1/products/categories
pub async fn list_categories(State(pool): State<PgPool>) -> AppResult<Json<Vec<String>>> {
    let categories = repository::list_categories(&pool).await?;
    Ok(Json(categories))
}

/// GET /api/v1/products/:slug
pub async fn get_product(
    State(pool): State<PgPool>,
    Path(slug): Path<String>,
) -> AppResult<Json<ProductDetail>> {
    let detail = repository::get_product_by_slug(&pool, &slug).await?;
    Ok(Json(detail))
}
