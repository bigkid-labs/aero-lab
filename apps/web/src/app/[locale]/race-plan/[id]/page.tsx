import { api } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function SharedRacePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await api.sessions.get(id).catch(() => null);

  if (!session || session.session_type !== "race_plan") notFound();

  const payload = session.payload as Record<string, unknown>;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "4rem 2rem" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.25em",
        color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        SHARED RACE PLAN
      </p>
      <pre style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--aero-off-white)",
        backgroundColor: "var(--aero-surface)", padding: "2rem", overflowX: "auto" }}>
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}
