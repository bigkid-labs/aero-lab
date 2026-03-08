use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, AppResult};

use super::model::{Product, ProductDetail, ProductGeometry};

/// Fetch all active products, optionally filtered by category.
pub async fn list_products(pool: &PgPool, category: Option<&str>) -> AppResult<Vec<Product>> {
    let products = match category {
        Some(cat) => {
            sqlx::query_as::<_, Product>(
                "SELECT * FROM products WHERE is_active = true AND category = $1
                 ORDER BY created_at DESC",
            )
            .bind(cat)
            .fetch_all(pool)
            .await?
        }
        None => {
            sqlx::query_as::<_, Product>(
                "SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC",
            )
            .fetch_all(pool)
            .await?
        }
    };

    Ok(products)
}

/// Fetch a single product by slug with its geometry specs.
pub async fn get_product_by_slug(pool: &PgPool, slug: &str) -> AppResult<ProductDetail> {
    let product = sqlx::query_as::<_, Product>(
        "SELECT * FROM products WHERE slug = $1 AND is_active = true",
    )
    .bind(slug)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Product '{slug}' not found")))?;

    let geometries = sqlx::query_as::<_, ProductGeometry>(
        "SELECT spec_key, CAST(spec_value AS FLOAT8) AS spec_value, unit
         FROM product_geometries WHERE product_id = $1
         ORDER BY spec_key",
    )
    .bind(product.id)
    .fetch_all(pool)
    .await?;

    Ok(ProductDetail { product, geometries })
}

/// Fetch distinct active categories (for frontend filter UI).
pub async fn list_categories(pool: &PgPool) -> AppResult<Vec<String>> {
    let rows = sqlx::query_scalar::<_, String>(
        "SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category",
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

/// Fetch a product UUID by slug — used internally (e.g. consultations).
pub async fn get_product_id_by_slug(pool: &PgPool, slug: &str) -> AppResult<Uuid> {
    let id = sqlx::query_scalar::<_, Uuid>(
        "SELECT id FROM products WHERE slug = $1 AND is_active = true",
    )
    .bind(slug)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Product '{slug}' not found")))?;

    Ok(id)
}
