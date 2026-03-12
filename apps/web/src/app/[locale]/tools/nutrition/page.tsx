"use client";
import { useState } from "react";
import { computeNutrition } from "@/lib/physicsEngine";

export default function NutritionPage() {
  const [weight, setWeight] = useState(70);
  const [duration, setDuration] = useState(3);
  const [zone, setZone] = useState<2 | 3 | 4>(3);
  const result = computeNutrition(weight, duration, zone);

  const labelStyle: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.62rem",
    letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--aero-grey)",
    display: "block", marginBottom: "0.4rem" };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.25em",
        color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>NUTRITION</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900,
        color: "var(--aero-white)", margin: "0 0 2rem" }}>Race Nutrition Calculator</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <label style={labelStyle}>Body Weight (kg)</label>
          <input type="range" min={40} max={130} value={weight} onChange={(e) => setWeight(Number(e.target.value))}
            style={{ accentColor: "var(--aero-accent)", width: "100%" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700,
            color: "var(--aero-white)", marginLeft: "0.75rem" }}>{weight} kg</span>
        </div>
        <div>
          <label style={labelStyle}>Race Duration (hours)</label>
          <input type="range" min={1} max={12} step={0.5} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
            style={{ accentColor: "var(--aero-accent)", width: "100%" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700,
            color: "var(--aero-white)", marginLeft: "0.75rem" }}>{duration}h</span>
        </div>
        <div>
          <label style={labelStyle}>Intensity Zone</label>
          <div style={{ display: "flex", gap: "0" }}>
            {([2, 3, 4] as const).map((z) => (
              <button key={z} type="button" onClick={() => setZone(z)} style={{
                flex: 1, padding: "0.6rem", border: "1px solid var(--aero-border)",
                backgroundColor: zone === z ? "var(--aero-accent)" : "var(--aero-surface)",
                color: zone === z ? "#fff" : "var(--aero-grey)",
                fontFamily: "var(--font-mono)", fontSize: "0.62rem", cursor: "pointer",
              }}>Z{z} — {z === 2 ? "Endurance" : z === 3 ? "Tempo" : "Threshold"}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2col" style={{ gap: "1rem" }}>
        {[
          { label: "Carbs / Hour", value: result.carbsPerHour + " g" },
          { label: "Sodium / Hour", value: result.sodiumPerHour + " mg" },
          { label: "Fluid / Hour", value: result.fluidPerHour + " ml" },
          { label: "Total Carbs", value: result.totalCarbsG + " g" },
          { label: "Total Fluid", value: result.totalFluidMl + " ml" },
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
