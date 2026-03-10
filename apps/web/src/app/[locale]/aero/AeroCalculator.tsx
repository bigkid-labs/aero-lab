"use client";

import { useState, useMemo, memo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  computeAeroResult,
  type AirDensityMode,
  type AeroParams,
  AIR_DENSITY_STANDARD,
  AIR_DENSITY_TROPICAL,
} from "@/lib/physicsEngine";
import { InfoIcon } from "@/components/ui/Tooltip";

// ─── CdA Position Data ────────────────────────────────────────────────────────

const POSITION_IDS = ["upright_road", "drops_road", "poor_tt", "average_tt", "good_tt", "elite_tt"] as const;
type PositionId = typeof POSITION_IDS[number];

const POSITION_CDA: Record<PositionId, number> = {
  upright_road: 0.38,
  drops_road:   0.32,
  poor_tt:      0.28,
  average_tt:   0.24,
  good_tt:      0.20,
  elite_tt:     0.17,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = Math.round(totalSec % 60);
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec}s`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AeroCalculator() {
  const t = useTranslations("aero");

  const [currentId, setCurrentId]     = useState<PositionId>("poor_tt");
  const [targetId, setTargetId]       = useState<PositionId>("elite_tt");
  const [speedKph, setSpeedKph]       = useState(38);
  const [distanceKm, setDistanceKm]   = useState(40);
  const [densityMode, setDensityMode] = useState<AirDensityMode>("tropical");
  const [applyYaw, setApplyYaw]       = useState(false);

  const params: AeroParams = {
    currentCda:  POSITION_CDA[currentId],
    targetCda:   POSITION_CDA[targetId],
    speedKph,
    distanceKm,
    densityMode,
    applyYaw,
  };

  // All heavy physics computation isolated in useMemo — zero UI re-calc cost
  const result = useMemo(() => computeAeroResult(params), [
    params.currentCda, params.targetCda, params.speedKph,
    params.distanceKm, params.densityMode, params.applyYaw,
  ]);

  const isImprovement = result.wattsSaved > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "3rem", alignItems: "start" }}>

      {/* ── LEFT: Controls ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

        {/* Position selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <PositionSelector
            title={t("currentPosition")}
            value={currentId}
            onChange={(v) => setCurrentId(v as PositionId)}
            highlightColor="var(--aero-grey-dim)"
            t={t}
          />
          <PositionSelector
            title={t("targetPosition")}
            value={targetId}
            onChange={(v) => setTargetId(v as PositionId)}
            highlightColor="var(--aero-accent)"
            t={t}
          />
        </div>

        {/* Sliders */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", padding: "2rem", border: "1px solid var(--aero-border)", backgroundColor: "var(--aero-surface)" }}>
          <SliderField label={t("speed")} unit="km/h" value={speedKph} min={25} max={55} onChange={setSpeedKph} />
          <SliderField label={t("distance")} unit="km" value={distanceKm} min={10} max={180} step={10} onChange={setDistanceKm} />
        </div>

        {/* Environment toggles */}
        <div style={{ padding: "1.5rem 2rem", border: "1px solid var(--aero-border)", backgroundColor: "var(--aero-surface)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Air density toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--aero-grey)" }}>
              {t("densityToggle")}
              <InfoIcon tooltip={t("tooltips.density")} />
            </span>
            <div style={{ display: "flex", gap: "0", border: "1px solid var(--aero-border)" }}>
              {(["standard", "tropical"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDensityMode(mode)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "0.45rem 0.85rem",
                    border: "none",
                    backgroundColor: densityMode === mode ? "var(--aero-accent)" : "transparent",
                    color: densityMode === mode ? "#fff" : "var(--aero-grey)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {mode === "standard" ? t("densityStandard") : t("densityTropical")}
                </button>
              ))}
            </div>
          </div>

          {/* Density readout */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--aero-grey-dim)" }}>
            ρ = {densityMode === "tropical" ? AIR_DENSITY_TROPICAL : AIR_DENSITY_STANDARD} kg/m³
          </div>

          {/* Yaw toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={applyYaw}
              onChange={(e) => setApplyYaw(e.target.checked)}
              style={{ accentColor: "var(--aero-accent)", width: "14px", height: "14px" }}
            />
            <span style={{ display: "flex", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: applyYaw ? "var(--aero-accent)" : "var(--aero-grey)" }}>
              {t("yawToggle")}
              <InfoIcon tooltip={t("tooltips.yaw")} />
            </span>
          </label>
        </div>

        <CdaBar currentId={currentId} targetId={targetId} t={t} />
      </div>

      {/* ── RIGHT: Sticky Results ── */}
      <div style={{ position: "sticky", top: "96px" }}>
        <div style={{ border: `1px solid ${isImprovement ? "var(--aero-accent)" : "var(--aero-border)"}`, backgroundColor: "var(--aero-surface)" }}>

          <div style={{ padding: "1.5rem", backgroundColor: isImprovement ? "rgba(255,69,0,0.05)" : "var(--aero-surface-2)", borderBottom: "1px solid var(--aero-border)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.22em", color: isImprovement ? "var(--aero-accent)" : "var(--aero-grey)", textTransform: "uppercase", display: "block" }}>
              {isImprovement ? t("savingsLabel") : t("noGain")}
            </span>
          </div>

          <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Metric
              value={isImprovement ? `−${Math.round(result.wattsSaved)}W` : "—"}
              label={
                <span style={{ display: "flex", alignItems: "center" }}>
                  {t("wattsSaved")}
                  <InfoIcon tooltip={t("tooltips.wattsSaved")} />
                </span>
              }
              sub={`From ${Math.round(result.powerCurrent)}W → ${Math.round(result.powerTarget)}W (aero drag)`}
              accent={isImprovement}
            />
            <Metric
              value={isImprovement ? `−${formatTime(result.timeSavedSec)}` : "—"}
              label={
                <span style={{ display: "flex", alignItems: "center" }}>
                  {t("timeSaved", { distance: distanceKm })}
                  <InfoIcon tooltip={t("tooltips.timeSaved")} />
                </span>
              }
              sub="At identical effort level"
              accent={isImprovement}
            />
            <Metric
              value={isImprovement ? `−${result.cdaDelta.toFixed(3)}m²` : "—"}
              label={
                <span style={{ display: "flex", alignItems: "center" }}>
                  {t("cdaReduction")}
                  <InfoIcon tooltip={t("tooltips.cda")} />
                </span>
              }
              sub={`${params.currentCda.toFixed(2)} → ${params.targetCda.toFixed(2)} m²`}
              accent={false}
            />
          </div>

          <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--aero-border)", backgroundColor: "var(--aero-surface-2)" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--aero-grey-dim)", lineHeight: 1.5, marginBottom: "1rem" }}>
              {t("disclaimer")}
            </p>
            <Link
              href="/consult"
              style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", padding: "0.85rem", backgroundColor: "var(--aero-accent)", color: "#fff", fontWeight: 700, textAlign: "center" }}
            >
              {t("unlockCta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type TFunc = ReturnType<typeof useTranslations<"aero">>;

const PositionSelector = memo(function PositionSelector({
  title, value, onChange, highlightColor, t,
}: {
  title: string; value: string; onChange: (v: string) => void;
  highlightColor: string; t: TFunc;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: highlightColor }}>
        {title}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {POSITION_IDS.map((id) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              textAlign: "left",
              padding: "0.75rem 1rem",
              border: `1px solid ${value === id ? highlightColor : "var(--aero-border)"}`,
              backgroundColor: value === id ? "rgba(255,69,0,0.06)" : "var(--aero-surface)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: value === id ? "var(--aero-white)" : "var(--aero-grey)", marginBottom: "0.2rem", fontWeight: value === id ? 600 : 400 }}>
              {t(`positions.${id}.label`)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--aero-grey-dim)", lineHeight: 1.3 }}>
                {t(`positions.${id}.description`)}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--aero-grey-dim)", marginLeft: "0.5rem", flexShrink: 0 }}>
                {POSITION_CDA[id].toFixed(2)}m²
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

function SliderField({ label, unit, value, min, max, step = 1, onChange }: {
  label: string; unit: string; value: number;
  min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--aero-grey)" }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, color: "var(--aero-white)", lineHeight: 1 }}>
          {value}<span style={{ fontSize: "0.9rem", color: "var(--aero-accent)", marginLeft: "3px" }}>{unit}</span>
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--aero-accent)" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--aero-grey-dim)" }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function CdaBar({ currentId, targetId, t }: { currentId: string; targetId: string; t: TFunc }) {
  const maxCda = Math.max(...POSITION_IDS.map((id) => POSITION_CDA[id]));
  return (
    <div style={{ padding: "1.5rem 2rem", border: "1px solid var(--aero-border)", backgroundColor: "var(--aero-surface)" }}>
      <span style={{ display: "flex", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--aero-grey-dim)", marginBottom: "1.25rem" }}>
        {t("cdaSpectrum")}
        <InfoIcon tooltip={t("tooltips.cda")} />
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {POSITION_IDS.map((id) => {
          const isCurrent = id === currentId;
          const isTarget  = id === targetId;
          const width = `${(POSITION_CDA[id] / maxCda) * 100}%`;
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: "6px", width, backgroundColor: isCurrent ? "var(--aero-grey)" : isTarget ? "var(--aero-accent)" : "var(--aero-border)", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: isCurrent || isTarget ? "var(--aero-white)" : "var(--aero-grey-dim)", minWidth: "50px", textAlign: "right" }}>
                {POSITION_CDA[id].toFixed(2)}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: isCurrent ? "var(--aero-grey)" : isTarget ? "var(--aero-accent)" : "var(--aero-grey-dim)", minWidth: "120px", letterSpacing: "0.08em" }}>
                {isCurrent ? "◀ CURRENT" : isTarget ? "▶ TARGET" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ value, label, sub, accent }: {
  value: string;
  label: React.ReactNode;
  sub: string;
  accent: boolean;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--aero-border)", paddingBottom: "1.5rem" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.02em", color: accent ? "var(--aero-accent)" : "var(--aero-white)", marginBottom: "0.4rem" }}>
        {value}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--aero-grey)", marginBottom: "0.25rem" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--aero-grey-dim)", lineHeight: 1.5 }}>
        {sub}
      </div>
    </div>
  );
}
