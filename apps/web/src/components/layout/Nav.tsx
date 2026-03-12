"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // pathname includes the locale prefix, e.g. /en or /vi
  const localePrefix = `/${locale}`;
  const isHome = pathname === localePrefix || pathname === `${localePrefix}/`;
  const transparent = isHome && !scrolled;

  const TOOL_LINKS = [
    { href: "/aero",              label: t("aeroCalc") },
    { href: "/race-planner",      label: t("racePlanner") },
    { href: "/tools/power-zones", label: t("powerZones") },
    { href: "/tools/race-pace",   label: t("racePace") },
    { href: "/tools/wind",        label: t("wind") },
    { href: "/tools/nutrition",   label: t("nutrition") },
  ];

  type NavLink = { href: string; label: string; cta?: boolean };
  const NAV_LINKS: NavLink[] = [
    { href: "/products", label: t("lab") },
    { href: "/fitting",  label: t("fitTool") },
    { href: "/consult",  label: t("bookSession"), cta: true },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: transparent ? "1px solid transparent" : "1px solid var(--aero-border)",
        backgroundColor: transparent ? "transparent" : "rgba(5,8,15,0.92)",
        backdropFilter: transparent ? "none" : "blur(16px)",
        WebkitBackdropFilter: transparent ? "none" : "blur(16px)",
        transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
      }}
    >
      <nav
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 2.5rem",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "var(--aero-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              BK
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "var(--aero-white)",
                lineHeight: 1,
              }}
            >
              BIGKID
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.45rem",
                fontWeight: 500,
                letterSpacing: "0.28em",
                color: "var(--aero-accent)",
                lineHeight: 1,
              }}
            >
              AERO LAB / VN
            </span>
          </div>
        </Link>

        {/* Hamburger — mobile only */}
        <button
          className="nav-hamburger"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((o) => !o)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <span style={{ display: "block", width: "22px", height: "2px", background: mobileOpen ? "var(--aero-accent)" : "var(--aero-white)", transition: "background 0.2s", transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ display: "block", width: "22px", height: "2px", background: "var(--aero-white)", opacity: mobileOpen ? 0 : 1, transition: "opacity 0.2s" }} />
          <span style={{ display: "block", width: "22px", height: "2px", background: mobileOpen ? "var(--aero-accent)" : "var(--aero-white)", transition: "background 0.2s", transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>

        {/* Links + Language Switcher */}
        <ul
          className="nav-links"
          style={{
            alignItems: "center",
            gap: "2.5rem",
            listStyle: "none",
          }}
        >
          {/* Tools dropdown */}
          <li style={{ position: "relative", listStyle: "none" }}
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}>
            <button style={{ background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--aero-grey)", padding: 0 }}>
              {t("tools")} ▾
            </button>
            {toolsOpen && (
              <div style={{ position: "absolute", top: "100%", left: 0, minWidth: "200px", zIndex: 200,
                backgroundColor: "rgba(5,8,15,0.96)", border: "1px solid var(--aero-border)",
                backdropFilter: "blur(12px)", display: "flex", flexDirection: "column" }}>
                {TOOL_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                    letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem 1.25rem",
                    color: "var(--aero-grey)", textDecoration: "none", borderBottom: "1px solid var(--aero-border)" }}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </li>
          {NAV_LINKS.map(({ href, label, cta }) => (
            <li key={href}>
              {cta ? (
                <Link
                  href={href}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "0.55rem 1.25rem",
                    backgroundColor: "var(--aero-accent)",
                    color: "#fff",
                    fontWeight: 700,
                    textDecoration: "none",
                    transition: "opacity 0.15s",
                    display: "inline-block",
                  }}
                >
                  {label}
                </Link>
              ) : (
                <Link
                  href={href}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    color: pathname.includes(href)
                      ? "var(--aero-white)"
                      : "var(--aero-grey)",
                    borderBottom: pathname.includes(href)
                      ? "1px solid var(--aero-accent)"
                      : "1px solid transparent",
                    paddingBottom: "3px",
                    transition: "color 0.15s, border-color 0.15s",
                  }}
                >
                  {label}
                </Link>
              )}
            </li>
          ))}
          <li>
            <LanguageSwitcher />
          </li>
        </ul>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-drawer${mobileOpen ? " open" : ""}`}>
        <span className="nav-drawer-section">{t("tools")}</span>
        {TOOL_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className="nav-drawer-link accent">{label}</Link>
        ))}
        <span className="nav-drawer-section">Menu</span>
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className="nav-drawer-link">{label}</Link>
        ))}
        <div style={{ marginTop: "1.5rem" }}>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
