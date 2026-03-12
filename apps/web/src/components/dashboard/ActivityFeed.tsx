import { Link } from "@/i18n/navigation";
import type { RiderSession } from "@/lib/api";

const TYPE_ICON: Record<string, string> = {
  fit: "◈", aero: "◎", race_plan: "▶", comparison: "⊟",
};

export function ActivityFeed({ sessions, labels }: {
  sessions: RiderSession[];
  labels: Record<string, string>;
}) {
  if (sessions.length === 0) {
    return (
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--aero-grey-dim)" }}>
        {labels.empty}
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {sessions.map((s) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1rem 0", borderBottom: "1px solid var(--aero-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: "var(--aero-accent)" }}>
              {TYPE_ICON[s.session_type] ?? "○"}
            </span>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--aero-white)" }}>
                {labels[s.session_type] ?? s.session_type}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--aero-grey-dim)" }}>
                {new Date(s.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Link href={`/race-plan/${s.id}`}
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.14em",
              textTransform: "uppercase", color: "var(--aero-accent)", textDecoration: "none" }}>
            {labels.view} →
          </Link>
        </div>
      ))}
    </div>
  );
}
