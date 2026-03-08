"use client";

import Link from "next/link";
import type { Product } from "@/lib/api";
import { CompareButton } from "./CompareButton";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = product.price_vnd
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
        product.price_vnd,
      )
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          transition: "border-color 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor = "var(--aero-accent)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")
        }
      >
        {/* Thumbnail / placeholder */}
        <div
          style={{
            aspectRatio: "4/3",
            backgroundColor: "var(--aero-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Category badge */}
          <span
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--aero-accent)",
              backgroundColor: "rgba(8,8,8,0.8)",
              padding: "0.25rem 0.5rem",
              border: "1px solid var(--aero-accent-dim)",
            }}
          >
            {product.category}
          </span>

          {/* 3D model placeholder — replaced with R3F viewer in Phase 2 */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              color: "var(--aero-grey-dim)",
              textTransform: "uppercase",
            }}
          >
            3D PREVIEW
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "var(--aero-white)",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {product.name}
          </h3>

          {product.description && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                color: "var(--aero-grey)",
                margin: 0,
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.description}
            </p>
          )}

          <div
            style={{
              marginTop: "0.5rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: formattedPrice ? "var(--aero-white)" : "var(--aero-grey-dim)",
              }}
            >
              {formattedPrice ?? "POA"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                color: "var(--aero-accent)",
                textTransform: "uppercase",
              }}
            >
              View →
            </span>
          </div>
          <div style={{ paddingTop: "0.5rem" }} onClick={(e) => e.preventDefault()}>
            <CompareButton slug={product.slug} name={product.name} />
          </div>
        </div>
      </article>
    </Link>
  );
}
