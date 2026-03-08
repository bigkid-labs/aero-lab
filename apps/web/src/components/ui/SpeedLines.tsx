// Pure CSS animated speed lines — no JS, SSR compatible.
// Simulates the visual language of a wind tunnel or aero sweep.

const LINES = [
  { top: "12%",  height: "1px",   duration: "2.2s", delay: "0.0s", opacity: 0.18, width: "55%" },
  { top: "18%",  height: "1px",   duration: "3.1s", delay: "0.4s", opacity: 0.09, width: "80%" },
  { top: "28%",  height: "1px",   duration: "1.9s", delay: "1.2s", opacity: 0.22, width: "42%" },
  { top: "38%",  height: "2px",   duration: "2.7s", delay: "0.7s", opacity: 0.14, width: "65%" },
  { top: "50%",  height: "1px",   duration: "1.6s", delay: "0.2s", opacity: 0.28, width: "35%" },
  { top: "55%",  height: "1px",   duration: "3.4s", delay: "1.8s", opacity: 0.07, width: "90%" },
  { top: "63%",  height: "1px",   duration: "2.0s", delay: "0.9s", opacity: 0.16, width: "50%" },
  { top: "72%",  height: "2px",   duration: "1.8s", delay: "1.5s", opacity: 0.20, width: "45%" },
  { top: "80%",  height: "1px",   duration: "2.9s", delay: "0.3s", opacity: 0.10, width: "70%" },
  { top: "88%",  height: "1px",   duration: "2.3s", delay: "1.1s", opacity: 0.13, width: "58%" },
] as const;

export function SpeedLines() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {LINES.map((line, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: line.top,
            left: 0,
            width: line.width,
            height: line.height,
            background: `linear-gradient(90deg, transparent 0%, var(--aero-accent) 40%, var(--aero-accent) 60%, transparent 100%)`,
            opacity: line.opacity,
            animation: `speedLine ${line.duration} ${line.delay} infinite linear`,
          }}
        />
      ))}
    </div>
  );
}
