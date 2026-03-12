"use client";
import { useState } from "react";
import { computeWindImpact, type AirDensityMode } from "@/lib/physicsEngine";

export default function WindPage() {
  const [baseCda, setBaseCda] = useState(0.25);
  const [windSpeed, setWindSpeed] = useState(20);
  const [yaw, setYaw] = useState(10);
  const [riderSpeed, setRiderSpeed] = useState(38);
  const [distanceKm, setDistKm] = useState(40);
  const [density] = useState<AirDensityMode>("tropical");
  const result = computeWindImpact(baseCda, windSpeed, yaw, riderSpeed, distanceKm, density);

  const labelStyle: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.62rem",
    letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--aero-grey)",
    display: "block", marginBottom: "0.4rem" };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.25em",
        color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>WIND IMPACT</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900,
        color: "var(--aero-white)", margin: "0 0 2rem" }}>Wind Impact Calculator</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {([
          { label: "Base CdA (m²)", value: baseCda, min: 0.12, max: 0.5, step: 0.01, set: setBaseCda },
          { label: "Wind Speed (km/h)", value: windSpeed, min: 0, max: 60, step: 1, set: setWindSpeed },
          { label: "Yaw Angle (°)", value: yaw, min: 0, max: 30, step: 1, set: setYaw },
          { label: "Rider Speed (km/h)", value: riderSpeed, min: 20, max: 55, step: 1, set: setRiderSpeed },
          { label: "Distance (km)", value: distanceKm, min: 10, max: 180, step: 5, set: setDistKm },
        ] as const).map(({ label, value, min, max, step, set }) => (
          <div key={label}>
            <label style={labelStyle}>{label}</label>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={(e) => set(Number(e.target.value))}
              style={{ accentColor: "var(--aero-accent)", width: "100%" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700,
              color: "var(--aero-white)", marginLeft: "0.75rem" }}>{value}</span>
          </div>
        ))}
      </div>

      <div className="grid-3col" style={{ gap: "1rem" }}>
        {[
          { label: "Effective CdA", value: result.effectiveCda.toFixed(3) + " m²" },
          { label: "Headwind Cost", value: "+" + Math.round(result.headwindPowerCostW) + " W" },
          { label: "Time Delta", value: Math.round(result.timeDeltaSec) + " s" },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "1.25rem", border: "1px solid var(--aero-border)", backgroundColor: "var(--aero-surface)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--aero-grey)", marginBottom: "0.5rem" }}>{label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900, color: "var(--aero-accent)" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
