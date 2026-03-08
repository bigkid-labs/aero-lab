import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AeroCalculator } from "./AeroCalculator";

export const metadata: Metadata = {
  title: "Aero Calculator",
  description: "Find out exactly how many watts you're losing to your current position.",
};

export default async function AeroPage() {
  const t = await getTranslations("aero");

  return (
    <div>
      <div
        style={{
          padding: "5rem 2.5rem 4rem",
          background: `
            radial-gradient(ellipse 60% 100% at 80% 50%, rgba(255,69,0,0.07) 0%, transparent 60%),
            var(--aero-surface)
          `,
          borderBottom: "1px solid var(--aero-border)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              color: "var(--aero-accent)",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "1.25rem",
            }}
          >
            {t("badge")}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 7rem)",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "var(--aero-white)",
              marginBottom: "1.5rem",
            }}
          >
            {t("line1")}
            <br />
            <span style={{ color: "var(--aero-accent)" }}>{t("line2")}</span>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "var(--aero-off-white)",
              maxWidth: "520px",
            }}
          >
            {t("description")}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2.5rem 8rem" }}>
        <AeroCalculator />
      </div>
    </div>
  );
}
