import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { api } from "@/lib/api";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // session is guaranteed non-null after the redirect guard above
  const sessions = await api.sessions.list(session!.access_token).catch(() => []);

  // Derive metrics from most recent sessions
  const lastFit  = sessions.find((s) => s.session_type === "fit");
  const lastAero = sessions.find((s) => s.session_type === "aero");

  const fitScore = lastFit
    ? String((lastFit.payload as { fit_score?: number }).fit_score?.toFixed(1) ?? "—")
    : "—";
  const cda = lastAero
    ? String((lastAero.payload as { targetCda?: number }).targetCda?.toFixed(3) ?? "—") + " m²"
    : "—";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.25em",
          color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          {t("badge")}
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 900,
          color: "var(--aero-white)", margin: 0 }}>
          {t("title")}
        </h1>
      </div>

      {/* Performance cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
        <PerformanceCard label={t("fitCard")} value={fitScore}
          sub={lastFit ? new Date(lastFit.created_at).toLocaleDateString() : undefined} accent />
        <PerformanceCard label={t("cdaCard")} value={cda}
          sub={lastAero ? new Date(lastAero.created_at).toLocaleDateString() : undefined} />
        <PerformanceCard label={t("actionCard")} value="→"
          sub={t("defaultAction")} />
      </div>

      {/* Activity feed */}
      <div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em",
          textTransform: "uppercase", color: "var(--aero-grey-dim)", marginBottom: "1rem" }}>
          {t("activity")}
        </p>
        <ActivityFeed sessions={sessions} labels={{
          fit: t("sessionTypes.fit"), aero: t("sessionTypes.aero"),
          race_plan: t("sessionTypes.race_plan"), comparison: t("sessionTypes.comparison"),
          empty: t("noActivity"), view: t("viewSession"),
        }} />
      </div>
    </div>
  );
}
