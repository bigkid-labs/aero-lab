import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SpeedLines } from "@/components/ui/SpeedLines";

// ─── Section 1: Hero ──────────────────────────────────────────────────────────

async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      style={{
        position: "relative",
        minHeight: "calc(100dvh + 72px)",
        marginTop: "-72px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 0 5rem",
        overflow: "hidden",
        background: `
          radial-gradient(ellipse 80% 60% at 70% 40%, rgba(255,69,0,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 50% 80% at 20% 80%, rgba(0,30,80,0.4) 0%, transparent 60%),
          var(--aero-black)
        `,
      }}
    >
      <SpeedLines />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--aero-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--aero-border) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "92px",
          left: "2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          animation: "fadeIn 1s 0.3s ease-out both",
          zIndex: 1,
        }}
      >
        <span className="mono-label" style={{ color: "var(--aero-accent)", letterSpacing: "0.2em" }}>
          {t("label")}
        </span>
        <span className="mono-label" style={{ fontSize: "0.55rem" }}>
          {t("location")}
        </span>
      </div>

      <div
        className="hero-metric"
        style={{
          position: "absolute",
          top: "92px",
          right: "2.5rem",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "6px",
          animation: "fadeIn 1s 0.5s ease-out both",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3.5rem, 8vw, 7rem)",
            fontWeight: 900,
            lineHeight: 1.0,
            color: "var(--aero-accent)",
            letterSpacing: "-0.02em",
          }}
        >
          −38W
        </div>
        <span className="mono-label" style={{ fontSize: "0.55rem", textAlign: "right", lineHeight: 1.6 }}>
          {t("metricLabel")}
        </span>
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 2.5rem",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          animation: "fadeUp 1s 0.2s ease-out both",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(5rem, 14vw, 13rem)",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: "var(--aero-white)",
              margin: 0,
            }}
          >
            {t("line1")}
            <br />
            <span style={{ color: "var(--aero-accent)" }}>{t("line2")}</span>
            <br />
            {t("line3")}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--aero-border)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
              lineHeight: 1.65,
              color: "var(--aero-off-white)",
              maxWidth: "480px",
              margin: 0,
            }}
          >
            {t("tagline")}
          </p>

          <div style={{ display: "flex", gap: "1rem", flexShrink: 0 }}>
            <Link
              href="/consult"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "1rem 2.25rem",
                backgroundColor: "var(--aero-accent)",
                color: "#fff",
                fontWeight: 700,
                transition: "opacity 0.15s",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              {t("ctaPrimary")}
            </Link>
            <Link
              href="/products"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "1rem 2rem",
                border: "1px solid var(--aero-border)",
                color: "var(--aero-grey)",
                transition: "border-color 0.2s, color 0.2s",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          animation: "fadeIn 1.5s 1.2s ease-out both",
        }}
      >
        <div
          style={{
            width: "1px",
            height: "48px",
            background: "linear-gradient(to bottom, var(--aero-accent), transparent)",
            animation: "pulse 2s infinite",
          }}
        />
        <span className="mono-label" style={{ fontSize: "0.5rem", letterSpacing: "0.3em" }}>
          {t("scroll")}
        </span>
      </div>
    </section>
  );
}

// ─── Section 2: Manifesto ────────────────────────────────────────────────────

async function Manifesto() {
  const t = await getTranslations("manifesto");

  return (
    <section
      style={{
        padding: "10rem 2.5rem",
        backgroundColor: "var(--aero-surface)",
        borderTop: "1px solid var(--aero-border)",
        borderBottom: "1px solid var(--aero-border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-2rem",
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(8rem, 20vw, 22rem)",
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: "1px var(--aero-border)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        SPEED
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative" }}>
        <span className="mono-label" style={{ color: "var(--aero-accent)", display: "block", marginBottom: "2.5rem" }}>
          {t("label")}
        </span>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 7vw, 6.5rem)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--aero-white)",
            maxWidth: "900px",
            marginBottom: "4rem",
          }}
        >
          {t("line1")}
          <br />
          <span style={{ color: "var(--aero-accent)" }}>{t("line2")}</span>
          <br />
          {t("line3")}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            lineHeight: 1.75,
            color: "var(--aero-off-white)",
            maxWidth: "580px",
            marginBottom: "5rem",
          }}
          dangerouslySetInnerHTML={{ __html: t.raw("body") as string }}
        />

        <div
          className="grid-3col"
          style={{
            gap: "0",
            borderTop: "1px solid var(--aero-border)",
          }}
        >
          {(["precision", "performance", "yours"] as const).map((key, i) => (
            <div
              key={key}
              style={{
                padding: "3rem 2.5rem",
                borderRight: i < 2 ? "1px solid var(--aero-border)" : "none",
                borderBottom: "1px solid var(--aero-border)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "4rem",
                  fontWeight: 900,
                  color: "var(--aero-border)",
                  lineHeight: 1,
                  marginBottom: "1.25rem",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  color: "var(--aero-accent)",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                {t(`pillars.${key}.title`)}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "var(--aero-grey)",
                  margin: 0,
                }}
              >
                {t(`pillars.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Numbers ───────────────────────────────────────────────────────

async function Numbers() {
  const t = await getTranslations("numbers");

  const metrics = [
    { key: "tolerance" as const, value: "<1", unit: "MM" },
    { key: "watts" as const, value: "38", unit: "W" },
    { key: "steps" as const, value: "3", unit: t("metrics.steps.unit") },
  ];

  return (
    <section
      style={{
        padding: "8rem 2.5rem",
        background: "var(--aero-black)",
        borderBottom: "1px solid var(--aero-border)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <span className="mono-label" style={{ color: "var(--aero-accent)", display: "block", marginBottom: "5rem" }}>
          {t("label")}
        </span>

        <div
          className="grid-3col"
          style={{
            gap: "0",
            borderTop: "1px solid var(--aero-border)",
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={m.key}
              style={{
                padding: "4rem 3rem 4rem 0",
                borderRight: i < 2 ? "1px solid var(--aero-border)" : "none",
                paddingLeft: i > 0 ? "3rem" : 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(5rem, 10vw, 9rem)",
                    fontWeight: 900,
                    lineHeight: 0.95,
                    letterSpacing: "-0.03em",
                    color: "var(--aero-white)",
                  }}
                >
                  {m.value}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    fontWeight: 700,
                    lineHeight: 1,
                    color: "var(--aero-accent)",
                    marginTop: "0.5rem",
                  }}
                >
                  {m.unit}
                </span>
              </div>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.18em",
                  color: "var(--aero-grey)",
                  marginBottom: "0.75rem",
                }}
              >
                {t(`metrics.${m.key}.label`)}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "var(--aero-grey-dim)",
                  margin: 0,
                  maxWidth: "280px",
                }}
              >
                {t(`metrics.${m.key}.sub`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: Process ───────────────────────────────────────────────────────

async function Process() {
  const t = await getTranslations("process");

  const steps = [
    { key: "geometry" as const, num: "01", href: "/fitting" },
    { key: "match" as const, num: "02", href: "/products" },
    { key: "consult" as const, num: "03", href: "/consult" },
  ];

  return (
    <section
      style={{
        padding: "8rem 2.5rem",
        backgroundColor: "var(--aero-surface-2)",
        borderBottom: "1px solid var(--aero-border)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "5rem",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          <div>
            <span className="mono-label" style={{ color: "var(--aero-accent)", display: "block", marginBottom: "1rem" }}>
              {t("label")}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: "var(--aero-white)",
              }}
            >
              {t("line1")}
              <br />
              <span style={{ color: "var(--aero-accent)" }}>{t("line2")}</span>
            </h2>
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "var(--aero-grey)",
              maxWidth: "360px",
            }}
          >
            {t("sub")}
          </p>
        </div>

        <div className="grid-3col" style={{ gap: "0" }}>
          {steps.map((step, i) => (
            <Link
              key={step.key}
              href={step.href}
              style={{
                textDecoration: "none",
                display: "block",
                padding: "3rem",
                border: "1px solid var(--aero-border)",
                borderLeft: i > 0 ? "none" : "1px solid var(--aero-border)",
                transition: "background 0.2s, border-color 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: "-1rem",
                  right: "1rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "8rem",
                  fontWeight: 900,
                  color: "var(--aero-surface)",
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {step.num}
              </div>

              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.22em",
                  color: "var(--aero-accent)",
                  backgroundColor: "var(--aero-accent-glow)",
                  border: "1px solid var(--aero-accent-dim)",
                  padding: "0.2rem 0.6rem",
                  textTransform: "uppercase",
                  marginBottom: "2rem",
                }}
              >
                {t(`steps.${step.key}.badge`)}
              </span>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                  color: "var(--aero-white)",
                  marginBottom: "1rem",
                  lineHeight: 1,
                }}
              >
                {t(`steps.${step.key}.title`)}
              </h3>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "var(--aero-grey)",
                  marginBottom: "2.5rem",
                }}
              >
                {t(`steps.${step.key}.body`)}
              </p>

              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--aero-accent)",
                }}
              >
                {t(`steps.${step.key}.cta`)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 5: Final CTA ────────────────────────────────────────────────────

async function FinalCTA() {
  const t = await getTranslations("finalCta");

  return (
    <section
      style={{
        padding: "10rem 2.5rem",
        background: `
          radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,69,0,0.08) 0%, transparent 70%),
          var(--aero-black)
        `,
        textAlign: "center",
        borderTop: "1px solid var(--aero-border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, var(--aero-accent), transparent)",
        }}
      />

      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <span className="mono-label" style={{ color: "var(--aero-accent)", display: "block", marginBottom: "2rem" }}>
          {t("label")}
        </span>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8vw, 7.5rem)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--aero-white)",
            marginBottom: "2.5rem",
          }}
        >
          {t("line1")}
          <br />
          <span style={{ color: "var(--aero-accent)" }}>{t("line2")}</span>
          <br />
          {t("line3")}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "var(--aero-off-white)",
            marginBottom: "3.5rem",
          }}
        >
          {t("body")}
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/consult"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "1.1rem 2.75rem",
              backgroundColor: "var(--aero-accent)",
              color: "#fff",
              fontWeight: 700,
              display: "inline-block",
            }}
          >
            {t("ctaPrimary")}
          </Link>
          <Link
            href="/fitting"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "1.1rem 2.5rem",
              border: "1px solid var(--aero-border)",
              color: "var(--aero-grey)",
              display: "inline-block",
            }}
          >
            {t("ctaSecondary")}
          </Link>
        </div>

        <div
          style={{
            marginTop: "5rem",
            paddingTop: "3rem",
            borderTop: "1px solid var(--aero-border)",
            display: "flex",
            justifyContent: "center",
            gap: "4rem",
            flexWrap: "wrap",
          }}
        >
          {(["uci", "handbuilt", "response"] as const).map((key) => (
            <div key={key} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "var(--aero-accent)",
                  textTransform: "uppercase",
                  marginBottom: "0.3rem",
                }}
              >
                {t(`trust.${key}.label`)}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--aero-grey)",
                }}
              >
                {t(`trust.${key}.value`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Numbers />
      <Process />
      <FinalCTA />
    </>
  );
}
