"use client";

import { useState, useRef, useCallback } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

type TooltipPos = {
  top: number;
  left: number;
  openLeft: boolean;
};

/**
 * Tooltip that uses position:fixed to escape any parent overflow constraints.
 * Direction (left/right) is auto-detected from available viewport space.
 */
export function Tooltip({ content, children }: TooltipProps) {
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const TOOLTIP_WIDTH = 260;
    const GAP = 10;
    // Open leftward if not enough room to the right
    const openLeft = window.innerWidth - rect.left < TOOLTIP_WIDTH + 16;
    setPos({
      top: rect.top - GAP,
      left: openLeft ? rect.right - TOOLTIP_WIDTH : rect.left,
      openLeft,
    });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <span
      ref={triggerRef}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "help" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
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
            width: "260px",
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
          {/* Arrow points down toward the trigger icon */}
          <span
            style={{
              position: "absolute",
              top: "100%",
              ...(pos.openLeft
                ? { right: "7px", left: "auto" }
                : { left: "7px", right: "auto" }),
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
