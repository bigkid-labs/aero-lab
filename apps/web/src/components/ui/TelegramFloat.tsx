"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

// Replace with your actual Telegram username or group link
const TELEGRAM_URL = "https://t.me/bigkidaerolab";

export function TelegramFloat() {
  const t = useTranslations("telegram");
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Appear after user has scrolled a bit
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "0.75rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Tooltip bubble */}
      {expanded && (
        <div
          style={{
            backgroundColor: "var(--aero-surface-2)",
            border: "1px solid var(--aero-border)",
            padding: "1rem 1.25rem",
            maxWidth: "220px",
            animation: "fadeUp 0.2s ease-out both",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              color: "var(--aero-white)",
              marginBottom: "0.5rem",
            }}
          >
            {t("title")}
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--aero-grey)",
              marginBottom: "1rem",
              lineHeight: 1.5,
            }}
          >
            {t("body")}
          </p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              backgroundColor: "#0088cc",
              color: "#fff",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {t("cta")}
          </a>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label="Chat with us on Telegram"
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "0",
          backgroundColor: expanded ? "#0088cc" : "var(--aero-surface-2)",
          border: `1px solid ${expanded ? "#0088cc" : "var(--aero-border)"}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s, border-color 0.2s",
          flexShrink: 0,
        }}
      >
        {/* Telegram plane icon — pure SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M21.8 2.15a1 1 0 0 0-1.02-.14L2.18 9.33a1 1 0 0 0 .06 1.88l4.38 1.46 1.7 5.53a1 1 0 0 0 1.68.42l2.4-2.26 4.63 3.42a1 1 0 0 0 1.55-.63l3-15a1 1 0 0 0-.38-.96ZM10.34 14.8l-.9-3.2 7.3-5.23-6.4 8.43Z"
            fill={expanded ? "#fff" : "var(--aero-accent)"}
          />
        </svg>
      </button>
    </div>
  );
}
