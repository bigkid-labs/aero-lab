import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { ProductViewer } from "@/components/3d/ProductViewer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await api.products.get(slug);
    return {
      title: product.name,
      description: product.description ?? undefined,
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations("products");

  let product;
  try {
    product = await api.products.get(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const formattedPrice = product.price_vnd
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
        product.price_vnd,
      )
    : null;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2rem" }}>

      {/* Breadcrumb */}
      <nav
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          color: "var(--aero-grey)",
          textTransform: "uppercase",
          marginBottom: "3rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <Link href="/products" style={{ color: "var(--aero-grey)", textDecoration: "none" }}>
          {t("title")}
        </Link>
        <span style={{ color: "var(--aero-grey-dim)" }}>›</span>
        <span style={{ color: "var(--aero-accent)" }}>{product.category.toUpperCase()}</span>
        <span style={{ color: "var(--aero-grey-dim)" }}>›</span>
        <span style={{ color: "var(--aero-white)" }}>{product.name.toUpperCase()}</span>
      </nav>

      {/* Two-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0",
          border: "1px solid var(--border)",
        }}
      >
        {/* Left — 3D viewer */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            aspectRatio: "1",
            borderRight: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {product.model_key ? (
            <ProductViewer modelKey={product.model_key} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--aero-grey-dim)", textTransform: "uppercase" }}>
                {t("no3d")}
              </span>
            </div>
          )}
        </div>

        {/* Right — Product info */}
        <div
          style={{
            padding: "3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "var(--aero-accent)",
                textTransform: "uppercase",
              }}
            >
              {product.category}
            </span>
            <h1
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "var(--aero-white)",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              {product.name}
            </h1>
            {formattedPrice && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--aero-white)",
                }}
              >
                {formattedPrice}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                color: "var(--aero-grey)",
                margin: 0,
              }}
            >
              {product.description}
            </p>
          )}

          {/* Geometry specs */}
          {product.geometries.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "var(--aero-grey-dim)",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                {t("specsTitle")}
              </p>
              {product.geometries.map(({ spec_key, spec_value, unit }, i) => (
                <div
                  key={spec_key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderTop: i === 0 ? "1px solid var(--border)" : undefined,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      color: "var(--aero-grey)",
                      textTransform: "uppercase",
                    }}
                  >
                    {spec_key.replace(/_/g, " ")}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      color: "var(--aero-white)",
                    }}
                  >
                    {spec_value} {unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "auto" }}>
            <Link
              href={`/consult?product=${product.slug}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "1rem",
                backgroundColor: "var(--aero-accent)",
                color: "var(--aero-black)",
                fontWeight: 700,
                textAlign: "center",
                transition: "opacity 0.15s",
              }}
            >
              {t("requestConsult")}
            </Link>
            <Link
              href="/fitting"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "1rem",
                border: "1px solid var(--border)",
                color: "var(--aero-grey)",
                textAlign: "center",
                transition: "border-color 0.15s, color 0.15s",
              }}
            >
              {t("checkFit")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
