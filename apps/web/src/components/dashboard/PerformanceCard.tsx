export function PerformanceCard({
  label, value, sub, accent = false,
}: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div style={{ padding: "1.5rem 2rem", border: "1px solid var(--aero-border)",
      backgroundColor: "var(--aero-surface)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.22em",
        textTransform: "uppercase", color: accent ? "var(--aero-accent)" : "var(--aero-grey)" }}>
        {label}
      </span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 900,
        color: accent ? "var(--aero-accent)" : "var(--aero-white)", lineHeight: 1 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--aero-grey-dim)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}
