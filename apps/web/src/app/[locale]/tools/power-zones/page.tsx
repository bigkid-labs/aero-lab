"use client";
import { useState } from "react";
import { computePowerZones } from "@/lib/physicsEngine";
import { InfoIcon } from "@/components/ui/Tooltip";

const TIPS = {
  ftp: "Functional Threshold Power — max average power sustained for 60 min. The baseline for all 7 training zones.",
  zones: {
    1: "Active Recovery — very low intensity. Promotes blood flow without adaptation stress.",
    2: "Endurance — aerobic base building. The foundation of TT and triathlon fitness.",
    3: "Tempo — comfortably hard. Improves aerobic capacity and muscular endurance.",
    4: "Lactate Threshold — race pace for 40–70 min efforts. Key zone for TT performance.",
    5: "VO2 Max — 3–8 min maximal efforts. Raises aerobic ceiling.",
    6: "Anaerobic Capacity — 30 sec–3 min all-out. Builds power above VO2 max.",
    7: "Neuromuscular Power — sprint efforts under 15 sec. Max force and speed.",
  } as Record<number, string>,
};

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
          textTransform: "uppercase", color: "var(--aero-grey)", display: "flex", alignItems: "center", marginBottom: "0.4rem" }}>
          FTP (watts)<InfoIcon tooltip={TIPS.ftp} />
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
              flex: 1, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center" }}>{z.name}<InfoIcon tooltip={TIPS.zones[z.zone]} /></span>
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
