"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api, type FitAnalysis, type Product } from "@/lib/api";
import { InfoIcon } from "@/components/ui/Tooltip";
import type { RiskLevel } from "@/lib/fitEngine";

interface FitFormProps {
  products: Product[];
}

const SCORE_COLOR = (score: number) => {
  if (score >= 8) return "var(--aero-accent)";
  if (score >= 6) return "#f0c040";
  return "#cc3333";
};

const RISK_COLOR: Record<RiskLevel, string> = {
  Low:      "#4caf7d",
  Moderate: "#f0c040",
  High:     "var(--aero-accent)",
};

export function FitForm({ products }: FitFormProps) {
  const t = useTranslations("fitting");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<FitAnalysis | null>(null);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    // Guard: reject obviously invalid measurements before hitting the API
    const torso    = Number(fd.get("torso_mm"));
    const arm      = Number(fd.get("arm_mm"));
    const inseam   = Number(fd.get("inseam_mm"));
    const flex     = Number(fd.get("flexibility"));
    const aggress  = Number(fd.get("aggression_level"));

    if (torso <= 0 || arm <= 0 || inseam <= 0) {
      setError("Body measurements must be positive numbers in millimetres.");
      setLoading(false);
      return;
    }

    try {
      const analysis = await api.fitting.analyze({
        full_name:        String(fd.get("full_name")),
        email:            String(fd.get("email")) || undefined,
        torso_mm:         torso,
        arm_mm:           arm,
        inseam_mm:        inseam,
        flexibility:      flex,
        aggression_level: aggress,
        product_slug:     String(fd.get("product_slug")),
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

        {/* ── Rider info ── */}
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>{t("sections.riderInfo")}</legend>
          <div style={rowStyle}>
            <Field label={t("fields.fullName")} name="full_name" type="text" required placeholder="Your name" />
            <Field label={t("fields.email")} name="email" type="email" placeholder={t("fields.emailPlaceholder")} />
          </div>
        </fieldset>

        {/* ── Body geometry ── */}
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>{t("sections.geometry")}</legend>
          <div style={rowStyle}>
            <FieldWithTooltip
              label={t("fields.torso")} name="torso_mm" type="number" required
              placeholder={t("fields.torsoPlaceholder")} min={300} max={800}
              tooltip={t("tooltips.torso")}
            />
            <FieldWithTooltip
              label={t("fields.arm")} name="arm_mm" type="number" required
              placeholder={t("fields.armPlaceholder")} min={300} max={900}
              tooltip={t("tooltips.arm")}
            />
            <FieldWithTooltip
              label={t("fields.inseam")} name="inseam_mm" type="number" required
              placeholder={t("fields.inseamPlaceholder")} min={500} max={1100}
              tooltip={t("tooltips.inseam")}
            />
          </div>
        </fieldset>

        {/* ── Position & product ── */}
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>{t("sections.positionProduct")}</legend>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Flexibility */}
            <div>
              <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
                {t("fields.flexibility")}
                <InfoIcon tooltip={t("tooltips.flexibility")} />
              </label>
              <select name="flexibility" required style={inputStyle} defaultValue="3">
                {([1, 2, 3, 4, 5] as const).map((val) => (
                  <option key={val} value={val}>{t(`flexibility.${val}`)}</option>
                ))}
              </select>
            </div>

            {/* Aggression level */}
            <div>
              <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
                {t("fields.aggressionLevel")}
                <InfoIcon tooltip={t("tooltips.aggression")} />
              </label>
              <select name="aggression_level" required style={inputStyle} defaultValue="3">
                {([1, 2, 3, 4, 5] as const).map((val) => (
                  <option key={val} value={val}>{t(`aggression.${val}`)}</option>
                ))}
              </select>
            </div>

            {/* Product */}
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

// ─── Fit Result ───────────────────────────────────────────────────────────────

function FitResult({
  result,
  t,
}: {
  result: FitAnalysis;
  t: ReturnType<typeof useTranslations<"fitting">>;
}) {
  const scoreColor = SCORE_COLOR(result.fit_score);
  const riskLevel  = result.risk_assessment as RiskLevel;
  const riskColor  = RISK_COLOR[riskLevel];
  const isHighRisk = riskLevel === "High";

  return (
    <div style={{ marginTop: "3rem", borderTop: "1px solid var(--aero-border)", paddingTop: "2.5rem" }}>

      {/* Score + verdict */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <span style={{ display: "flex", alignItems: "center", fontFamily: "var(--font-display)", fontSize: "4rem", fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
          {result.fit_score.toFixed(1)}
          <InfoIcon tooltip={t("tooltips.fitScore")} />
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

      {/* Risk assessment badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem", border: `1px solid ${riskColor}`, marginBottom: "1.5rem", backgroundColor: `${riskColor}11` }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: riskColor, display: "inline-block", animation: isHighRisk ? "pulse 1.2s ease-in-out infinite" : "none" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: riskColor }}>
          {t("riskLabel")}:&nbsp;
          {riskLevel === "High"     ? t("riskHigh")     : null}
          {riskLevel === "Moderate" ? t("riskModerate") : null}
          {riskLevel === "Low"      ? t("riskLow")      : null}
        </span>
      </div>

      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--aero-grey)", lineHeight: 1.7, marginBottom: "2rem" }}>
        {result.recommendation}
      </p>

      {/* Adjustments */}
      {result.adjustments.length > 0 && (
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--aero-grey-dim)", textTransform: "uppercase", marginBottom: "1rem" }}>
            {t("adjustmentsTitle")}
          </p>
          {result.adjustments.map((adj) => (
            <div key={adj.spec} style={{ padding: "1rem", border: "1px solid var(--aero-border)", marginBottom: "0.5rem", backgroundColor: "var(--aero-surface)" }}>
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

      {/* CTA — pulse animation when High Risk */}
      <a
        href="/consult"
        className={isHighRisk ? "high-risk-pulse" : undefined}
        style={{
          display: "inline-block",
          marginTop: "2rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "0.8rem 1.5rem",
          backgroundColor: isHighRisk ? "var(--aero-accent)" : "transparent",
          border: "1px solid var(--aero-accent)",
          color: isHighRisk ? "#fff" : "var(--aero-accent)",
          textDecoration: "none",
          transition: "background 0.15s",
        }}
      >
        {t("discussCta")}
      </a>
    </div>
  );
}

// ─── Primitive Components ─────────────────────────────────────────────────────

function Field({ label, name, type, required, placeholder, min, max }: {
  label: string; name: string; type: string;
  required?: boolean; placeholder?: string; min?: number; max?: number;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type} required={required} placeholder={placeholder} min={min} max={max} style={inputStyle} />
    </div>
  );
}

function FieldWithTooltip({ label, name, type, required, placeholder, min, max, tooltip }: {
  label: string; name: string; type: string; tooltip: string;
  required?: boolean; placeholder?: string; min?: number; max?: number;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
        {label}
        <InfoIcon tooltip={tooltip} />
      </label>
      <input name={name} type={type} required={required} placeholder={placeholder} min={min} max={max} style={inputStyle} />
    </div>
  );
}

// ─── Style Tokens ─────────────────────────────────────────────────────────────

const fieldsetStyle: React.CSSProperties = {
  border: "1px solid var(--aero-border)",
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
  backgroundColor: "var(--aero-surface)",
  border: "1px solid var(--aero-border)",
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
  backgroundColor: loading ? "var(--aero-surface-2)" : "var(--aero-accent)",
  color: loading ? "var(--aero-grey)" : "#fff",
  border: "none",
  cursor: loading ? "not-allowed" : "pointer",
  fontWeight: 700,
  transition: "background 0.15s",
  alignSelf: "flex-start",
});
