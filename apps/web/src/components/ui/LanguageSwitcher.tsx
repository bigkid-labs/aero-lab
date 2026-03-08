"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggle = () => {
    const next = locale === "en" ? "vi" : "en";
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggle}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        background: "none",
        border: "1px solid var(--aero-border)",
        color: "var(--aero-grey)",
        padding: "0.35rem 0.6rem",
        cursor: "pointer",
        transition: "border-color 0.15s, color 0.15s",
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
      }}
      title={locale === "en" ? "Switch to Vietnamese" : "Chuyển sang tiếng Anh"}
    >
      <span style={{ color: locale === "en" ? "var(--aero-accent)" : "var(--aero-grey)" }}>EN</span>
      <span style={{ opacity: 0.4 }}>/</span>
      <span style={{ color: locale === "vi" ? "var(--aero-accent)" : "var(--aero-grey)" }}>VI</span>
    </button>
  );
}
