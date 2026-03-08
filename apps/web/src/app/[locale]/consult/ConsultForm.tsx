"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api, type Product } from "@/lib/api";

interface ConsultFormProps {
  products: Product[];
  defaultProductSlug?: string;
}

export function ConsultForm({ products, defaultProductSlug }: ConsultFormProps) {
  const t = useTranslations("consult");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const productSlug = String(fd.get("product_slug")) || undefined;

    try {
      await api.consultations.create({
        full_name: String(fd.get("full_name")),
        email: String(fd.get("email")) || undefined,
        phone: String(fd.get("phone")) || undefined,
        product_slug: productSlug || undefined,
        message: String(fd.get("message")) || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          padding: "3rem",
          border: "1px solid var(--aero-accent)",
          backgroundColor: "var(--surface)",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em", color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "1rem" }}>
          {t("successLabel")}
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--aero-white)", lineHeight: 1.7 }}>
          {t("successBody")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={fieldWrapStyle}>
        <label style={labelStyle} htmlFor="full_name">{t("fields.fullName")}</label>
        <input id="full_name" name="full_name" type="text" required placeholder="Your name" style={inputStyle} />
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ ...fieldWrapStyle, flex: 1 }}>
          <label style={labelStyle} htmlFor="email">{t("fields.email")}</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" style={inputStyle} />
        </div>
        <div style={{ ...fieldWrapStyle, flex: 1 }}>
          <label style={labelStyle} htmlFor="phone">{t("fields.phone")}</label>
          <input id="phone" name="phone" type="tel" placeholder={t("fields.phonePlaceholder")} style={inputStyle} />
        </div>
      </div>

      <div style={fieldWrapStyle}>
        <label style={labelStyle} htmlFor="product_slug">{t("fields.product")}</label>
        <select id="product_slug" name="product_slug" style={inputStyle} defaultValue={defaultProductSlug ?? ""}>
          <option value="">{t("fields.noProduct")}</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name} — {p.category}</option>
          ))}
        </select>
      </div>

      <div style={fieldWrapStyle}>
        <label style={labelStyle} htmlFor="message">{t("fields.message")}</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder={t("fields.messagePlaceholder")}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {error && (
        <div style={{ padding: "0.75rem", border: "1px solid #cc3333", color: "#cc3333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} style={submitStyle(loading)}>
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const fieldWrapStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
};
const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--aero-grey)",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--aero-white)",
  fontFamily: "var(--font-sans)",
  fontSize: "0.9rem",
  padding: "0.65rem 0.75rem",
  outline: "none",
};
const submitStyle = (loading: boolean): React.CSSProperties => ({
  fontFamily: "var(--font-mono)",
  fontSize: "0.75rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  padding: "1rem 2rem",
  backgroundColor: loading ? "var(--aero-muted)" : "var(--aero-accent)",
  color: loading ? "var(--aero-grey)" : "var(--aero-black)",
  border: "none",
  cursor: loading ? "not-allowed" : "pointer",
  fontWeight: 700,
  alignSelf: "flex-start",
  transition: "background 0.15s",
});
