"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

type TooltipPos = {
  top: number;
  left: number;
  arrowLeft: number;
};

const TOOLTIP_WIDTH = 260;
const MARGIN = 12;

/**
 * Tooltip that uses position:fixed to escape parent overflow constraints.
 * - Hover on desktop, tap to toggle on touch devices.
 * - Position is clamped so the box never overflows either viewport edge.
 * - Arrow always points at the trigger regardless of clamped position.
 */
export function Tooltip({ content, children }: TooltipProps) {
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const compute = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    const idealLeft = rect.left;
    const left = Math.max(MARGIN, Math.min(idealLeft, vw - TOOLTIP_WIDTH - MARGIN));
    // Arrow points at center of trigger icon
    const arrowLeft = Math.max(8, Math.min(rect.left + rect.width / 2 - left, TOOLTIP_WIDTH - 16));

    setPos({ top: rect.top - MARGIN, left, arrowLeft });
  }, []);

  const show = useCallback(() => compute(), [compute]);
  const hide = useCallback(() => setPos(null), []);

  // Touch: toggle on tap
  const handleClick = useCallback(() => {
    setPos((prev) => {
      if (prev) return null;
      compute();
      return null;
    });
    setTimeout(() => compute(), 0);
  }, [compute]);

  // Close on outside interaction
  useEffect(() => {
    if (!pos) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setPos(null);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [pos]);

  return (
    <span
      ref={triggerRef}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "help" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={handleClick}
    >
      {children}
      {pos && (
        <span
          role="tooltip"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: `${TOOLTIP_WIDTH}px`,
            maxWidth: `calc(100vw - ${MARGIN * 2}px)`,
            backgroundColor: "var(--aero-surface-2)",
            // Left accent bar = brand signal; muted border on other 3 sides
            borderTop: "1px solid var(--aero-border)",
            borderRight: "1px solid var(--aero-border)",
            borderBottom: "1px solid var(--aero-border)",
            borderLeft: "2px solid var(--aero-accent)",
            padding: "0.7rem 1rem",
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 16px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,69,0,0.06)",
            // Animation handles the transform (translateY -100% + fade + slide)
            animation: "tooltipIn 0.14s ease-out forwards",
          }}
        >
          {/* Engineering callout header */}
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.46rem",
            letterSpacing: "0.26em",
            color: "var(--aero-accent)",
            textTransform: "uppercase",
            marginBottom: "0.45rem",
            opacity: 0.7,
          }}>
            // INFO
          </div>
          <div style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.73rem",
            color: "var(--aero-off-white)",
            lineHeight: 1.58,
          }}>
            {content}
          </div>
          {/* Arrow pointing down at trigger */}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: `${pos.arrowLeft}px`,
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid var(--aero-accent)",
            }}
          />
        </span>
      )}
    </span>
  );
}

/** Small ⓘ icon that wraps a Tooltip — use inline next to field labels */
export function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip content={tooltip}>
      <span className="tooltip-icon">i</span>
    </Tooltip>
  );
}
