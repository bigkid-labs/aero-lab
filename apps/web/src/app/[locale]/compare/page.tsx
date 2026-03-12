"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { calcAeroPower, calcTimeSavingsSec, getAirDensity } from "@/lib/physicsEngine";

interface Config {
  label: string;
  cda: number;
}

const DEFAULT_CONFIGS: Config[] = [
  { label: "Current", cda: 0.28 },
  { label: "Target",  cda: 0.22 },
];

export default function ComparePage() {
  const t = useTranslations("compare");
  const [configs, setConfigs]   = useState<Config[]>(DEFAULT_CONFIGS);
  const [speedKph, setSpeedKph] = useState(38);
  const [distanceKm, setDistKm] = useState(40);

  const density = getAirDensity("tropical");

  function updateConfig(i: number, field: keyof Config, value: string | number) {
    setConfigs((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    );
  }

  function addConfig() {
    if (configs.length >= 3) return;
    setConfigs((prev) => [...prev, { label: `Config ${prev.length + 1}`, cda: 0.24 }]);
  }

  const bestCda = Math.min(...configs.map((c) => c.cda));

  // Shared slider definitions — extracted to avoid `as const` inference issues
  const speedSlider = { label: t("speed"),    value: speedKph,   min: 25, max: 55,  set: setSpeedKph };
  const distSlider  = { label: t("distance"), value: distanceKm, min: 10, max: 180, set: setDistKm };
  const sliders     = [speedSlider, distSlider];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2.5rem" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
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
          fontFamily: "var(--font-display)",
          fontSize: "2rem",
          fontWeight: 900,
          color: "var(--aero-white)",
          margin: "0 0 2rem",
        }}
      >
        {t("title")}
      </h1>

      {/* Shared inputs */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {sliders.map(({ label, value, min, max, set }) => (
          <div key={label}>
            <label
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--aero-grey)",
                display: "block",
                marginBottom: "0.4rem",
              }}
            >
              {label}
            </label>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => set(Number(e.target.value))}
              style={{ accentColor: "var(--aero-accent)", width: "200px" }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "var(--aero-white)",
                marginLeft: "0.75rem",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Config columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${configs.length}, 1fr)`,
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {configs.map((cfg, i) => {
          const power = calcAeroPower(cfg.cda, speedKph, density, false);
          const timeSaved =
            i === 0
              ? 0
              : calcTimeSavingsSec(
                  configs[0].cda,
                  cfg.cda,
                  speedKph,
                  distanceKm,
                  density,
                  false,
                );
          const isBest = cfg.cda === bestCda;

          return (
            <div
              key={i}
              style={{
                border: `1px solid ${isBest ? "var(--aero-accent)" : "var(--aero-border)"}`,
                backgroundColor: "var(--aero-surface)",
                padding: "1.5rem",
              }}
            >
              <input
                value={cfg.label}
                onChange={(e) => updateConfig(i, "label", e.target.value)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--aero-accent)",
                  background: "none",
                  border: "none",
                  outline: "none",
                  marginBottom: "1.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "text",
                  width: "100%",
                }}
              />

              <label
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--aero-grey)",
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                {t("cdaLabel")}
              </label>
              <input
                type="number"
                min={0.12}
                max={0.5}
                step={0.01}
                value={cfg.cda}
                onChange={(e) => updateConfig(i, "cda", Number(e.target.value))}
                style={{
                  width: "100%",
                  backgroundColor: "var(--aero-surface-2)",
                  border: "1px solid var(--aero-border)",
                  color: "var(--aero-white)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  padding: "0.5rem 0.75rem",
                  outline: "none",
                  marginBottom: "1.5rem",
                }}
              />

              <div
                style={{
                  borderTop: "1px solid var(--aero-border)",
                  paddingTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--aero-grey-dim)",
                    }}
                  >
                    {t("powerLabel")}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: "var(--aero-white)",
                    }}
                  >
                    {Math.round(power)}W
                  </div>
                </div>
                {i > 0 && (
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--aero-grey-dim)",
                      }}
                    >
                      {t("timeSavedLabel")}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.6rem",
                        fontWeight: 900,
                        color:
                          timeSaved > 0
                            ? "var(--aero-accent)"
                            : "var(--aero-grey)",
                      }}
                    >
                      {timeSaved > 0 ? `\u2212${Math.round(timeSaved)}s` : "\u2014"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {configs.length < 3 && (
          <button
            onClick={addConfig}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "0.75rem 1.5rem",
              border: "1px solid var(--aero-border)",
              backgroundColor: "transparent",
              color: "var(--aero-grey)",
              cursor: "pointer",
            }}
          >
            + {t("addConfig")}
          </button>
        )}
        <Link
          href={`/race-planner?cda=${bestCda}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--aero-accent)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          {t("copyToPlanner")} →
        </Link>
      </div>
    </div>
  );
}
