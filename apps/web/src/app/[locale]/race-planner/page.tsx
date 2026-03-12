"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  computeRacePlan, RACE_DISTANCES,
  type Terrain, type AirDensityMode, type RacePlanResult,
} from "@/lib/physicsEngine";

const GEAR_ITEMS = [
  { key: "position", cda: 0.000, href: "/fitting" },
  { key: "helmet",   cda: 0.010, href: "/products" },
  { key: "skinsuit", cda: 0.008, href: "/products" },
  { key: "wheels",   cda: 0.012, href: "/products" },
  { key: "bars",     cda: 0.015, href: "/products" },
];

const TIMELINE_KEYS = ["12w", "8w", "4w", "2w", "race"] as const;

export default function RacePlannerPage() {
  const t = useTranslations("racePlanner");

  const [eventName, setEventName]     = useState("");
  const [distanceKm, setDistanceKm]   = useState(90);
  const [goalHH, setGoalHH]           = useState(2);
  const [goalMM, setGoalMM]           = useState(30);
  const [terrain, setTerrain]         = useState<Terrain>("flat");
  const [density, setDensity]         = useState<AirDensityMode>("tropical");
  const [weight, setWeight]           = useState(70);
  const [currentCda, setCurrentCda]   = useState(0.28);
  const [result, setResult]           = useState<RacePlanResult | null>(null);

  // density is used in handleGenerate; suppress unused-variable lint
  void density;

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const goalTimeSec = goalHH * 3600 + goalMM * 60;
    setResult(computeRacePlan({
      distanceKm, goalTimeSec, currentCda,
      densityMode: density, terrain, bodyWeightKg: weight,
    }));
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "4rem 2rem" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.25em",
        color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        {t("badge")}
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900,
        color: "var(--aero-white)", margin: "0 0 0.5rem" }}>{t("title")}</h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--aero-grey)",
        lineHeight: 1.7, marginBottom: "3rem" }}>{t("description")}</p>

      <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Event</legend>
          <div className="form-row" style={rowStyle}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>{t("eventName")}</label>
              <input value={eventName} onChange={(e) => setEventName(e.target.value)}
                placeholder={t("eventNamePlaceholder")} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t("distance")}</label>
              <select value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} style={inputStyle}>
                {Object.entries(RACE_DISTANCES).map(([k, v]) => (
                  <option key={k} value={v}>{k.toUpperCase()} ({v} km)</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row" style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t("goalTime")}</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="number" min={0} max={9} value={goalHH}
                  onChange={(e) => setGoalHH(Number(e.target.value))} style={{ ...inputStyle, width: "80px" }} />
                <span style={{ color: "var(--aero-grey)", alignSelf: "center" }}>:</span>
                <input type="number" min={0} max={59} value={goalMM}
                  onChange={(e) => setGoalMM(Number(e.target.value))} style={{ ...inputStyle, width: "80px" }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t("terrain")}</label>
              <div style={{ display: "flex", gap: "0" }}>
                {(["flat","rolling","hilly"] as Terrain[]).map((t_) => (
                  <button key={t_} type="button" onClick={() => setTerrain(t_)} className="terrain-btn" style={{
                    flex: 1, padding: "0.6rem", border: "1px solid var(--aero-border)",
                    backgroundColor: terrain === t_ ? "var(--aero-accent)" : "var(--aero-surface)",
                    color: terrain === t_ ? "#fff" : "var(--aero-grey)",
                    fontFamily: "var(--font-mono)", fontSize: "0.6rem", cursor: "pointer",
                  }}>{t(`terrain${t_.charAt(0).toUpperCase() + t_.slice(1)}` as string)}</button>
                ))}
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Rider</legend>
          <div className="form-row" style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t("bodyWeight")}</label>
              <input type="number" min={40} max={130} value={weight}
                onChange={(e) => setWeight(Number(e.target.value))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t("currentCda")}</label>
              <input type="number" min={0.12} max={0.5} step={0.01} value={currentCda}
                onChange={(e) => setCurrentCda(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
        </fieldset>

        <button type="submit" className="btn-submit" style={submitStyle}>{t("submit")}</button>
      </form>

      {result && (
        <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Key metrics */}
          <div className="grid-3col" style={{ gap: "1rem" }}>
            {[
              { label: t("targetCda"), value: result.targetCda.toFixed(3) + " m²" },
              { label: t("powerTarget"), value: Math.round(result.requiredPowerW) + " W" },
              { label: t("cdaGap"), value: result.cdaGapM2.toFixed(3) + " m²" },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "1.5rem", border: "1px solid var(--aero-border)",
                backgroundColor: "var(--aero-surface)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.2em",
                  color: "var(--aero-grey)", textTransform: "uppercase", marginBottom: "0.5rem" }}>{label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900,
                  color: "var(--aero-accent)" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Gear checklist */}
          <div>
            <p style={sectionLabel}>{t("gearChecklist")}</p>
            {GEAR_ITEMS.map((item, i) => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.85rem 1rem", border: "1px solid var(--aero-border)", marginBottom: "0.4rem",
                backgroundColor: "var(--aero-surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                    color: "var(--aero-accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--aero-white)" }}>
                    {t(`gear.${item.key}` as string)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  {item.cda > 0 && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--aero-grey)" }}>
                      ~−{item.cda.toFixed(3)} m²
                    </span>
                  )}
                  <Link href={item.href} style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem",
                    color: "var(--aero-accent)", textDecoration: "none", letterSpacing: "0.12em" }}>
                    VIEW →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div>
            <p style={sectionLabel}>{t("fitTimeline")}</p>
            {TIMELINE_KEYS.map((key) => (
              <div key={key} style={{ padding: "0.75rem 1rem", borderLeft: "2px solid var(--aero-accent)",
                marginBottom: "0.5rem", backgroundColor: "var(--aero-surface)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--aero-off-white)" }}>
                  {t(`timeline.${key}` as string)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const fieldsetStyle: React.CSSProperties = { border: "1px solid var(--aero-border)", padding: "1.5rem", margin: 0 };
const legendStyle: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.6rem",
  letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--aero-accent)", padding: "0 0.5rem" };
const rowStyle: React.CSSProperties = { display: "flex", gap: "1rem", flexWrap: "wrap" };
const labelStyle: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.62rem",
  letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--aero-grey)",
  display: "block", marginBottom: "0.4rem" };
const inputStyle: React.CSSProperties = { width: "100%", backgroundColor: "var(--aero-surface)",
  border: "1px solid var(--aero-border)", color: "var(--aero-white)", fontFamily: "var(--font-mono)",
  fontSize: "0.85rem", padding: "0.6rem 0.75rem", outline: "none" };
const submitStyle: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.75rem",
  letterSpacing: "0.2em", textTransform: "uppercase", padding: "1rem 2rem",
  backgroundColor: "var(--aero-accent)", color: "#fff", border: "none", cursor: "pointer",
  fontWeight: 700, alignSelf: "flex-start" };
const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.6rem",
  letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--aero-grey-dim)", marginBottom: "1rem" };
