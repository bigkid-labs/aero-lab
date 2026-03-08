import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description: "Precision-engineered TT & Triathlon components.",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const t = await getTranslations("products");

  const [products, categories] = await Promise.all([
    api.products.list(category),
    api.products.categories(),
  ]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "3rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              color: "var(--aero-accent)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            {t("catalogLabel")} / {category ? category.toUpperCase() : t("all").toUpperCase()}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--aero-white)",
              margin: 0,
            }}
          >
            {t("title")}
          </h1>
        </div>

        {categories.length > 0 && (
          <nav
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}
            aria-label="Filter by category"
          >
            <FilterLink label={t("all")} href="/products" active={!category} />
            {categories.map((cat) => (
              <FilterLink
                key={cat}
                label={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                active={category === cat}
              />
            ))}
          </nav>
        )}
      </div>

      {products.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "8rem 2rem",
            color: "var(--aero-grey)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {t("empty")}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1px",
            backgroundColor: "var(--border)",
          }}
        >
          {products.map((product) => (
            <div key={product.id} style={{ backgroundColor: "var(--background)" }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <a
      href={href}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "0.35rem 0.75rem",
        border: `1px solid ${active ? "var(--aero-accent)" : "var(--border)"}`,
        color: active ? "var(--aero-accent)" : "var(--aero-grey)",
        transition: "border-color 0.15s, color 0.15s",
      }}
    >
      {label}
    </a>
  );
}
