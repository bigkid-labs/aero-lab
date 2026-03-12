"use client";
import { useState } from "react";
import { computeRacePace, type AirDensityMode } from "@/lib/physicsEngine";
import { InfoIcon } from "@/components/ui/Tooltip";

const TIPS = {
  cda: "Your aerodynamic drag area (m²). Reducing CdA is the highest-ROI speed gain for the same power output.",
  weight: "Affects rolling resistance and gravitational load in the physics model.",
  requiredSpeed: "Constant average speed required to finish within your goal time.",
  estPower: "Average watts required to hold the target speed at your CdA, weight, and tropical air density (ρ = 1.20 kg/m³).",
  negativeSplit: "Target first-half speed for a 5%-slower start strategy — optimizes energy distribution and reduces blowup risk.",
};

export default function RacePacePage() {
  const [goalHH, setGoalHH] = useState(2);
  const [goalMM, setGoalMM] = useState(30);
  const [distanceKm, setDistanceKm] = useState(90);
  const [cda, setCda] = useState(0.25);
  const [weight, setWeight] = useState(70);
  const [density] = useState<AirDensityMode>("tropical");
  const [result, setResult] = useState<ReturnType<typeof computeRacePace> | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const goalTimeSec = goalHH * 3600 + goalMM * 60;
    setResult(computeRacePace(goalTimeSec, distanceKm, cda, density, weight));
  }

  const labelStyle: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.62rem",
    letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--aero-grey)",
    display: "flex", alignItems: "center", marginBottom: "0.4rem" };
  const inputStyle: React.CSSProperties = { backgroundColor: "var(--aero-surface)",
    border: "1px solid var(--aero-border)", color: "var(--aero-white)", fontFamily: "var(--font-mono)",
    fontSize: "0.85rem", padding: "0.6rem 0.75rem", outline: "none", width: "100%" };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.25em",
        color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>RACE PACE</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900,
        color: "var(--aero-white)", margin: "0 0 2rem" }}>Race Pace Calculator</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Goal Time (HH:MM)</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="number" min={0} max={9} value={goalHH} onChange={(e) => setGoalHH(Number(e.target.value))} style={{ ...inputStyle, width: "80px" }} />
              <span style={{ color: "var(--aero-grey)", alignSelf: "center" }}>:</span>
              <input type="number" min={0} max={59} value={goalMM} onChange={(e) => setGoalMM(Number(e.target.value))} style={{ ...inputStyle, width: "80px" }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Distance (km)</label>
            <input type="number" min={10} max={200} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Current CdA (m²)<InfoIcon tooltip={TIPS.cda} /></label>
            <input type="number" min={0.12} max={0.5} step={0.01} value={cda} onChange={(e) => setCda(Number(e.target.value))} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Body Weight (kg)<InfoIcon tooltip={TIPS.weight} /></label>
            <input type="number" min={40} max={130} value={weight} onChange={(e) => setWeight(Number(e.target.value))} style={inputStyle} />
          </div>
        </div>
        <button type="submit" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.2em",
          textTransform: "uppercase", padding: "0.85rem 2rem", backgroundColor: "var(--aero-accent)",
          color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, alignSelf: "flex-start" }}>
          Calculate
        </button>
      </form>

      {result && (
        <div className="grid-3col" style={{ gap: "1rem" }}>
          {[
            { label: "Required Speed", tip: TIPS.requiredSpeed, value: result.requiredSpeedKph.toFixed(1) + " km/h" },
            { label: "Est. Power", tip: TIPS.estPower, value: Math.round(result.estimatedPowerW) + " W" },
            { label: "Negative Split", tip: TIPS.negativeSplit, value: result.negativeSplitKph.toFixed(1) + " km/h" },
          ].map(({ label, tip, value }) => (
            <div key={label} style={{ padding: "1.25rem", border: "1px solid var(--aero-border)", backgroundColor: "var(--aero-surface)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em",
                textTransform: "uppercase", color: "var(--aero-grey)", marginBottom: "0.5rem",
                display: "flex", alignItems: "center" }}>
                {label}<InfoIcon tooltip={tip} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "var(--aero-accent)" }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
