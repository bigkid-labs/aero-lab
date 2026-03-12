"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

type TooltipPos = {
  top: number;
  left: number;
  arrowLeft: number; // px from left edge of tooltip box, for the arrow
};

const TOOLTIP_WIDTH = 240;
const MARGIN = 10; // min gap from viewport edge

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

    // Ideal: align left edge of tooltip with left edge of trigger
    const idealLeft = rect.left;
    // Clamp so tooltip stays within [MARGIN, vw - TOOLTIP_WIDTH - MARGIN]
    const left = Math.max(MARGIN, Math.min(idealLeft, vw - TOOLTIP_WIDTH - MARGIN));
    // Arrow should point at the center of the trigger icon
    const arrowLeft = Math.max(6, Math.min(rect.left + rect.width / 2 - left, TOOLTIP_WIDTH - 14));

    setPos({ top: rect.top - MARGIN, left, arrowLeft });
  }, []);

  const show = useCallback(() => compute(), [compute]);
  const hide = useCallback(() => setPos(null), []);

  // Touch: toggle on tap
  const handleClick = useCallback(() => {
    setPos((prev) => {
      if (prev) return null;
      compute();
      return null; // compute sets state asynchronously via setPos inside
    });
    // Small delay to ensure compute runs after state is cleared
    setTimeout(() => compute(), 0);
  }, [compute]);

  // Close on outside tap
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
            transform: "translateY(-100%)",
            width: `${TOOLTIP_WIDTH}px`,
            maxWidth: `calc(100vw - ${MARGIN * 2}px)`,
            backgroundColor: "var(--aero-surface-2)",
            border: "1px solid var(--aero-accent)",
            padding: "0.875rem 1rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.76rem",
            color: "var(--aero-off-white)",
            lineHeight: 1.55,
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {content}
          {/* Arrow points down at the trigger, position adjusted to follow trigger even when box is clamped */}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: `${pos.arrowLeft}px`,
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "7px solid var(--aero-accent)",
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
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          border: "1px solid var(--aero-grey-dim)",
          fontSize: "0.6rem",
          color: "var(--aero-grey)",
          marginLeft: "5px",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        i
      </span>
    </Tooltip>
  );
}
