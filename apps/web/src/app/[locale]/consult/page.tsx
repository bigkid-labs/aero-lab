import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { ConsultForm } from "./ConsultForm";

export const metadata: Metadata = {
  title: "Consult",
  description: "Request a consultation with the BIGKID Aero Lab team.",
};

interface PageProps {
  searchParams: Promise<{ product?: string }>;
}

export default async function ConsultPage({ searchParams }: PageProps) {
  const { product: productSlug } = await searchParams;
  const t = await getTranslations("consult");
  const products = await api.products.list().catch(() => []);

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem" }}>
      <div style={{ marginBottom: "3rem" }}>
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
          {t("badge")}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--aero-white)",
            margin: "0 0 1rem",
          }}
        >
          {t("title")}
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--aero-grey)", lineHeight: 1.7 }}>
          {t("description")}
        </p>
      </div>

      <ConsultForm products={products} defaultProductSlug={productSlug} />
    </div>
  );
}
