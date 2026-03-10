/**
 * fitEngine.ts — Fit Engine Types & Frontend Constants
 *
 * Defines all interfaces for the biomechanical fit system.
 * Flexibility penalty lookup table lives here so values can be tuned
 * without touching calculation or UI logic.
 */

// ─── Risk Assessment ──────────────────────────────────────────────────────────

export type RiskLevel = "Low" | "Moderate" | "High";

// ─── Flexibility Penalty Table ────────────────────────────────────────────────

/**
 * Safety offset (mm) applied to ideal_reach when rider flexibility is restricted.
 * Prevents biomechanically unsafe positions for riders who cannot achieve
 * a full aero tuck without spinal or hip compensation.
 *
 * Key:   flexibility score (1–5)
 * Value: reach offset in mm (negative = reduce reach demand)
 *
 * Stack and drop offsets are derived proportionally in the backend engine:
 *   stack_offset = |reach_offset| × 0.6  (raise front end)
 *   drop_offset  = |reach_offset| × 0.3  (reduce pad drop)
 */
export const FLEXIBILITY_PENALTY_TABLE: Readonly<Record<number, number>> = {
  1: -30, // Rigid: high-risk — reduce reach 30mm, trigger specialist CTA
  2: -15, // Stiff: moderate — reduce reach 15mm
  3:   0, // Average: no penalty
  4:   0, // Flexible: no penalty
  5:   0, // Very flexible: no penalty
};

// ─── Typed Interfaces ─────────────────────────────────────────────────────────

export interface FittingData {
  fullName:        string;
  email?:          string;
  torso_mm:        number;
  arm_mm:          number;
  inseam_mm:       number;
  flexibility:     number; // 1–5: how restricted the rider's range of motion is
  aggressionLevel: number; // 1–5: desired position aggression (1=comfort, 5=max aero)
  productSlug:     string;
}

export interface FitAdjustmentData {
  spec:       string;
  current_mm: number;
  ideal_mm:   number;
  delta_mm:   number;
  note:       string;
}

export interface FitResultData {
  fitScore:        number;
  verdict:         string;
  recommendation:  string;
  adjustments:     FitAdjustmentData[];
  riskAssessment:  RiskLevel;
  specialistCTA:   boolean;
}
