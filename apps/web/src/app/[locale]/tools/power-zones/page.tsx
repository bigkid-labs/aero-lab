"use client";
import { useState } from "react";
import { computePowerZones } from "@/lib/physicsEngine";

export default function PowerZonesPage() {
  const [ftp, setFtp] = useState(250);
  const zones = computePowerZones(ftp);

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.25em",
        color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>POWER ZONES</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900,
        color: "var(--aero-white)", margin: "0 0 2rem" }}>Power Zone Calculator</h1>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--aero-grey)", display: "block", marginBottom: "0.4rem" }}>
          FTP (watts)
        </label>
        <input type="number" min={100} max={500} value={ftp}
          onChange={(e) => setFtp(Number(e.target.value))}
          style={{ backgroundColor: "var(--aero-surface)", border: "1px solid var(--aero-border)",
            color: "var(--aero-white)", fontFamily: "var(--font-mono)", fontSize: "0.9rem",
            padding: "0.65rem 0.75rem", width: "160px", outline: "none" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {zones.map((z) => (
          <div key={z.zone} style={{ display: "flex", alignItems: "center", gap: "1.5rem",
            padding: "1rem 1.25rem", border: "1px solid var(--aero-border)",
            backgroundColor: "var(--aero-surface)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 900,
              color: "var(--aero-border)", minWidth: "2rem" }}>Z{z.zone}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--aero-white)",
              flex: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>{z.name}</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700,
              color: "var(--aero-accent)" }}>
              {z.range[0]}–{z.zone < 7 ? z.range[1] : "∞"} W
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
