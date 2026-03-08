"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api, type FitAnalysis, type Product } from "@/lib/api";

interface FitFormProps {
  products: Product[];
}

const SCORE_COLOR = (score: number) => {
  if (score >= 8) return "var(--aero-accent)";
  if (score >= 6) return "#f0c040";
  return "#cc3333";
};

export function FitForm({ products }: FitFormProps) {
  const t = useTranslations("fitting");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FitAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    try {
      const analysis = await api.fitting.analyze({
        full_name: String(fd.get("full_name")),
        email: String(fd.get("email")) || undefined,
        torso_mm: Number(fd.get("torso_mm")),
        arm_mm: Number(fd.get("arm_mm")),
        inseam_mm: Number(fd.get("inseam_mm")),
        flexibility: Number(fd.get("flexibility")),
        product_slug: String(fd.get("product_slug")),
      });
      setResult(analysis);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>{t("sections.riderInfo")}</legend>
          <div style={rowStyle}>
            <Field label={t("fields.fullName")} name="full_name" type="text" required placeholder="Your name" />
            <Field label={t("fields.email")} name="email" type="email" placeholder={t("fields.emailPlaceholder")} />
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>{t("sections.geometry")}</legend>
          <div style={rowStyle}>
            <Field label={t("fields.torso")} name="torso_mm" type="number" required placeholder={t("fields.torsoPlaceholder")} min={300} max={800} />
            <Field label={t("fields.arm")} name="arm_mm" type="number" required placeholder={t("fields.armPlaceholder")} min={300} max={900} />
            <Field label={t("fields.inseam")} name="inseam_mm" type="number" required placeholder={t("fields.inseamPlaceholder")} min={500} max={1100} />
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>{t("sections.positionProduct")}</legend>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>{t("fields.flexibility")}</label>
              <select name="flexibility" required style={inputStyle} defaultValue="3">
                {([1, 2, 3, 4, 5] as const).map((val) => (
                  <option key={val} value={val}>{t(`flexibility.${val}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t("fields.product")}</label>
              <select name="product_slug" required style={inputStyle}>
                <option value="">{t("fields.productPlaceholder")}</option>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <button type="submit" disabled={loading} style={submitStyle(loading)}>
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #cc3333", color: "#cc3333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
          {error}
        </div>
      )}

      {result && <FitResult result={result} t={t} />}
    </div>
  );
}

// ─── Fit result display ───────────────────────────────────────────────────────

function FitResult({ result, t }: { result: FitAnalysis; t: ReturnType<typeof useTranslations<"fitting">> }) {
  const scoreColor = SCORE_COLOR(result.fit_score);

  return (
    <div style={{ marginTop: "3rem", borderTop: "1px solid var(--border)", paddingTop: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "4rem", fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
          {result.fit_score.toFixed(1)}
        </span>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.15em", color: scoreColor }}>
            {result.verdict}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "var(--aero-grey)", marginTop: "0.2rem" }}>
            {t("scoreLabel")}
          </div>
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--aero-grey)", lineHeight: 1.7, marginBottom: "2rem" }}>
        {result.recommendation}
      </p>

      {result.adjustments.length > 0 && (
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--aero-grey-dim)", textTransform: "uppercase", marginBottom: "1rem" }}>
            {t("adjustmentsTitle")}
          </p>
          {result.adjustments.map((adj) => (
            <div key={adj.spec} style={{ padding: "1rem", border: "1px solid var(--border)", marginBottom: "0.5rem", backgroundColor: "var(--surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--aero-white)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {adj.spec}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: adj.delta_mm > 0 ? "#f0c040" : "var(--aero-accent)" }}>
                  {adj.delta_mm > 0 ? "+" : ""}{adj.delta_mm.toFixed(1)}mm
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--aero-grey)", margin: 0 }}>
                {adj.note}
              </p>
            </div>
          ))}
        </div>
      )}

      <a href="/consult" style={{ display: "inline-block", marginTop: "2rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.8rem 1.5rem", border: "1px solid var(--aero-accent)", color: "var(--aero-accent)", textDecoration: "none" }}>
        {t("discussCta")}
      </a>
    </div>
  );
}

// ─── Primitive components ─────────────────────────────────────────────────────

function Field({ label, name, type, required, placeholder, min, max }: {
  label: string; name: string; type: string;
  required?: boolean; placeholder?: string; min?: number; max?: number;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={labelStyle}>{label}</label>
      <input
        name={name} type={type} required={required}
        placeholder={placeholder} min={min} max={max}
        style={inputStyle}
      />
    </div>
  );
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const fieldsetStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "1.5rem",
  margin: 0,
};
const legendStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.6rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--aero-accent)",
  padding: "0 0.5rem",
};
const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
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
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
  padding: "0.6rem 0.75rem",
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
  transition: "background 0.15s",
  alignSelf: "flex-start",
});
