import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const TOOLS = [
  { href: "/aero",              key: "aeroCalc",    icon: "◎" },
  { href: "/race-planner",      key: "racePlanner", icon: "▶" },
  { href: "/tools/power-zones", key: "powerZones",  icon: "⚡" },
  { href: "/tools/race-pace",   key: "racePace",    icon: "⏱" },
  { href: "/tools/wind",        key: "wind",        icon: "〜" },
  { href: "/tools/nutrition",   key: "nutrition",   icon: "◈" },
] as const;

export default async function ToolsHubPage() {
  const t = await getTranslations("tools");

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2.5rem" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.25em",
        color: "var(--aero-accent)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        ENGINEERING TOOLS
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900,
        color: "var(--aero-white)", margin: "0 0 3rem" }}>
        {t("title")}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
        {TOOLS.map(({ href, key, icon }) => (
          <Link key={key} href={href} style={{ textDecoration: "none", display: "block",
            padding: "2rem", border: "1px solid var(--aero-border)",
            backgroundColor: "var(--aero-surface)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem",
              color: "var(--aero-accent)", marginBottom: "1rem" }}>{icon}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600,
              color: "var(--aero-white)", textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: "0.5rem" }}>
              {t(`${key}.title` as string)}
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem",
              color: "var(--aero-grey)", lineHeight: 1.6, margin: 0 }}>
              {t(`${key}.sub` as string)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
