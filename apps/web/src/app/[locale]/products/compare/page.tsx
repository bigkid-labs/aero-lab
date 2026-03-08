import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { api, ApiError, type ProductDetail } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compare Products" };

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { a, b } = await searchParams;
  if (!a || !b) notFound();

  const t = await getTranslations("products");

  let products: [ProductDetail, ProductDetail];
  try {
    const [pa, pb] = await Promise.all([api.products.get(a), api.products.get(b)]);
    products = [pa, pb];
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [p1, p2] = products;

  const allSpecKeys = Array.from(
    new Set([...p1.geometries.map((g) => g.spec_key), ...p2.geometries.map((g) => g.spec_key)])
  ).sort();

  const getSpec = (product: ProductDetail, key: string) =>
    product.geometries.find((g) => g.spec_key === key);

  const formatPrice = (vnd: number | null) =>
    vnd
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(vnd)
      : t("poa");

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "7rem 2.5rem 5rem" }}>
      <div style={{ marginBottom: "4rem" }}>
        <Link
          href="/products"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.2em",
            color: "var(--aero-grey)",
            textDecoration: "none",
            textTransform: "uppercase",
            display: "inline-block",
            marginBottom: "1.5rem",
          }}
        >
          {t("backToLab")}
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            color: "var(--aero-white)",
            lineHeight: 0.9,
          }}
        >
          {t("comparison")}
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 1fr",
          gap: "0",
          borderBottom: "2px solid var(--aero-accent)",
          paddingBottom: "2rem",
          marginBottom: "0",
        }}
      >
        <div />
        {[p1, p2].map((p) => (
          <div key={p.slug} style={{ padding: "0 2rem", borderLeft: "1px solid var(--aero-border)" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                letterSpacing: "0.2em",
                color: "var(--aero-accent)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              {p.category}
            </span>
            <Link href={`/products/${p.slug}`} style={{ textDecoration: "none" }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--aero-white)",
                  lineHeight: 1,
                  marginBottom: "0.75rem",
                }}
              >
                {p.name}
              </h2>
            </Link>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, color: "var(--aero-white)" }}>
              {formatPrice(p.price_vnd)}
            </div>
          </div>
        ))}
      </div>

      <CompareRow label={t("category")}>
        {[p1, p2].map((p) => <Cell key={p.slug}>{p.category}</Cell>)}
      </CompareRow>

      <CompareRow label={t("description")}>
        {[p1, p2].map((p) => <Cell key={p.slug} muted>{p.description ?? "—"}</Cell>)}
      </CompareRow>

      {allSpecKeys.length > 0 && (
        <>
          <SectionHeader>{t("specsTitle")}</SectionHeader>
          {allSpecKeys.map((key) => {
            const s1 = getSpec(p1, key);
            const s2 = getSpec(p2, key);
            const unit = s1?.unit ?? s2?.unit ?? "";
            const v1 = s1?.spec_value;
            const v2 = s2?.spec_value;
            const better =
              v1 !== undefined && v2 !== undefined
                ? v1 < v2 ? "left" : v1 > v2 ? "right" : "equal"
                : null;

            return (
              <CompareRow key={key} label={key.replace(/_/g, " ")}>
                <Cell highlight={better === "left"}>{v1 !== undefined ? `${v1} ${unit}` : "—"}</Cell>
                <Cell highlight={better === "right"}>{v2 !== undefined ? `${v2} ${unit}` : "—"}</Cell>
              </CompareRow>
            );
          })}
        </>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 1fr",
          gap: "0",
          borderTop: "1px solid var(--aero-border)",
          paddingTop: "2rem",
          marginTop: "2rem",
        }}
      >
        <div />
        {[p1, p2].map((p) => (
          <div key={p.slug} style={{ padding: "0 2rem", borderLeft: "1px solid var(--aero-border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href={`/consult?product=${p.slug}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "0.85rem 1.5rem",
                backgroundColor: "var(--aero-accent)",
                color: "#fff",
                fontWeight: 700,
                textAlign: "center",
                display: "block",
              }}
            >
              {t("consultOnThis")}
            </Link>
            <Link
              href={`/products/${p.slug}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "0.85rem 1.5rem",
                border: "1px solid var(--aero-border)",
                color: "var(--aero-grey)",
                textAlign: "center",
                display: "block",
              }}
            >
              {t("viewProduct")}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 1fr", borderBottom: "1px solid var(--aero-border)" }}>
      <div
        style={{
          padding: "1.1rem 1rem 1.1rem 0",
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--aero-grey-dim)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Cell({ children, highlight, muted }: { children: React.ReactNode; highlight?: boolean; muted?: boolean }) {
  return (
    <div
      style={{
        padding: "1.1rem 2rem",
        borderLeft: "1px solid var(--aero-border)",
        fontFamily: muted ? "var(--font-sans)" : "var(--font-mono)",
        fontSize: muted ? "0.85rem" : "0.9rem",
        color: highlight ? "var(--aero-accent)" : muted ? "var(--aero-grey)" : "var(--aero-white)",
        fontWeight: highlight ? 700 : 400,
        backgroundColor: highlight ? "var(--aero-accent-glow)" : "transparent",
        display: "flex",
        alignItems: "center",
        transition: "background 0.15s",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "1.5rem 0 0.75rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.58rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "var(--aero-accent)",
        borderBottom: "1px solid var(--aero-border)",
      }}
    >
      {children}
    </div>
  );
}
