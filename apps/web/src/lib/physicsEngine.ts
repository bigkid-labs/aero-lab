/**
 * physicsEngine.ts — Aero Physics Constants & Formulas
 *
 * All physical constants live here. Changing a value here propagates to all
 * UI components automatically — no hunting through component files.
 */

// ─── Air Density Modes ────────────────────────────────────────────────────────

export type AirDensityMode = "standard" | "tropical";

/** ISA standard atmosphere: 15°C, sea level, 0% humidity */
export const AIR_DENSITY_STANDARD = 1.225; // kg/m³

/**
 * Tropical mode (TRS §3.1): adjusted for warm, humid race conditions.
 * Representative of South/Southeast Asia outdoor events.
 * ρ ≈ 1.18 kg/m³ at ~28°C, 75% RH, sea level.
 */
export const AIR_DENSITY_TROPICAL = 1.18; // kg/m³

/**
 * Yaw penalty factor (TRS §3.1): real-world crosswind correction.
 * P_effective = P_base × (1 + YAW_PENALTY_FACTOR)
 * A 5% power penalty models a ~10° average yaw angle at race pace.
 */
export const YAW_PENALTY_FACTOR = 0.05;

export function getAirDensity(mode: AirDensityMode): number {
  return mode === "tropical" ? AIR_DENSITY_TROPICAL : AIR_DENSITY_STANDARD;
}

// ─── Core Physics ─────────────────────────────────────────────────────────────

/**
 * Aerodynamic drag power: P = 0.5 × ρ × CdA × v³
 *
 * @param cda       Drag area (m²)
 * @param speedKph  Rider speed (km/h)
 * @param density   Air density (kg/m³)
 * @param applyYaw  Apply crosswind yaw penalty (+5%)
 */
export function calcAeroPower(
  cda: number,
  speedKph: number,
  density: number,
  applyYaw: boolean,
): number {
  const speedMs = speedKph / 3.6;
  const base = 0.5 * density * cda * Math.pow(speedMs, 3);
  return applyYaw ? base * (1 + YAW_PENALTY_FACTOR) : base;
}

/**
 * Time saved (seconds) at identical effort when CdA is reduced.
 * Uses the cube-root power law: new_speed = old_speed × (P_old / P_new)^(1/3)
 */
export function calcTimeSavingsSec(
  cdaCurrent: number,
  cdaTarget: number,
  speedKph: number,
  distanceKm: number,
  density: number,
  applyYaw: boolean,
): number {
  const pCurrent = calcAeroPower(cdaCurrent, speedKph, density, applyYaw);
  const pTarget  = calcAeroPower(cdaTarget,  speedKph, density, applyYaw);
  if (pTarget <= 0 || pCurrent <= pTarget) return 0;
  const speedGainFactor = Math.pow(pCurrent / pTarget, 1 / 3);
  const newSpeedKph     = speedKph * speedGainFactor;
  const currentTimeSec  = (distanceKm / speedKph) * 3600;
  const newTimeSec      = (distanceKm / newSpeedKph) * 3600;
  return currentTimeSec - newTimeSec;
}

// ─── Typed Interfaces ─────────────────────────────────────────────────────────

export interface AeroParams {
  currentCda:  number;
  targetCda:   number;
  speedKph:    number;
  distanceKm:  number;
  densityMode: AirDensityMode;
  applyYaw:    boolean;
}

export interface AeroResult {
  wattsSaved:   number;
  timeSavedSec: number;
  cdaDelta:     number;
  powerCurrent: number;
  powerTarget:  number;
  density:      number;
}

export function computeAeroResult(params: AeroParams): AeroResult {
  const density     = getAirDensity(params.densityMode);
  const powerCurrent = calcAeroPower(params.currentCda, params.speedKph, density, params.applyYaw);
  const powerTarget  = calcAeroPower(params.targetCda,  params.speedKph, density, params.applyYaw);
  const wattsSaved  = powerCurrent - powerTarget;
  const timeSavedSec = calcTimeSavingsSec(
    params.currentCda, params.targetCda,
    params.speedKph, params.distanceKm,
    density, params.applyYaw,
  );
  return {
    wattsSaved,
    timeSavedSec,
    cdaDelta:     params.currentCda - params.targetCda,
    powerCurrent,
    powerTarget,
    density,
  };
}
