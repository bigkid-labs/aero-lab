"use client";

import { Suspense, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Extracted so that useSearchParams() is inside a Suspense boundary (Next.js 15 requirement).
function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") ?? "/dashboard";
  // Only follow relative paths to prevent open redirect
  const next =
    rawNext.startsWith("/") && !rawNext.includes("//") && !rawNext.includes("://")
      ? rawNext
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(t("error"));
      setLoading(false);
      return;
    }
    router.push(next);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div style={{ maxWidth: "420px", margin: "8rem auto", padding: "0 2rem" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.25em",
          color: "var(--aero-accent)",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
        }}
      >
        {t("badge")}
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.5rem",
          fontWeight: 900,
          color: "var(--aero-white)",
          marginBottom: "0.5rem",
        }}
      >
        {t("title")}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.9rem",
          color: "var(--aero-grey)",
          marginBottom: "2.5rem",
          lineHeight: 1.6,
        }}
      >
        {t("subtitle")}
      </p>

      {/* Google */}
      <button onClick={handleGoogle} style={socialBtnStyle}>
        {t("google")}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--aero-border)" }} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            color: "var(--aero-grey-dim)",
            letterSpacing: "0.2em",
          }}
        >
          {t("orDivider")}
        </span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "var(--aero-border)" }} />
      </div>

      {/* Email + password */}
      <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={labelStyle}>{t("emailLabel")}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={labelStyle}>{t("password")}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>
        {error && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#cc3333" }}>
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} style={submitStyle(loading)}>
          {loading ? "..." : t("submit")}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.62rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--aero-grey)",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--aero-surface)",
  border: "1px solid var(--aero-border)",
  color: "var(--aero-white)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
  padding: "0.65rem 0.75rem",
  outline: "none",
  width: "100%",
};

const socialBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.85rem",
  border: "1px solid var(--aero-border)",
  backgroundColor: "var(--aero-surface)",
  color: "var(--aero-white)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const submitStyle = (loading: boolean): React.CSSProperties => ({
  padding: "0.85rem",
  border: "none",
  backgroundColor: loading ? "var(--aero-surface-2)" : "var(--aero-accent)",
  color: loading ? "var(--aero-grey)" : "#fff",
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  fontWeight: 700,
  cursor: loading ? "not-allowed" : "pointer",
});
