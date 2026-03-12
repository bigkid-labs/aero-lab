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

// ─── Race Planner ─────────────────────────────────────────────────────────────

export type Terrain = "flat" | "rolling" | "hilly";
export type RaceDistance = "sprint" | "olympic" | "70.3" | "full" | "custom";

/** km for each standard triathlon distance (bike leg only) */
export const RACE_DISTANCES: Record<Exclude<RaceDistance, "custom">, number> = {
  sprint:  20,
  olympic: 40,
  "70.3":  90,
  full:    180,
};

/** Effective rolling resistance penalty by terrain (added to aero power) */
const TERRAIN_FACTOR: Record<Terrain, number> = {
  flat:    1.00,
  rolling: 1.06,
  hilly:   1.14,
};

export interface RacePlanParams {
  distanceKm:   number;
  goalTimeSec:  number;
  currentCda:   number;
  densityMode:  AirDensityMode;
  terrain:      Terrain;
  bodyWeightKg: number;
}

export interface RacePlanResult {
  requiredAvgSpeedKph: number;
  requiredPowerW:      number;
  targetCda:           number;
  cdaGapM2:            number;
  achievable:          boolean;
}

/**
 * Given a goal time and distance, compute the CdA required.
 * Solves P = 0.5 × ρ × CdA × v³ × terrain_factor for CdA,
 * where v is the speed required to cover distanceKm in goalTimeSec.
 */
export function computeRacePlan(params: RacePlanParams): RacePlanResult {
  const { distanceKm, goalTimeSec, currentCda, densityMode, terrain, bodyWeightKg } = params;
  const density = getAirDensity(densityMode);
  const tf = TERRAIN_FACTOR[terrain];

  const requiredAvgSpeedKph = (distanceKm / goalTimeSec) * 3600;
  const speedMs = requiredAvgSpeedKph / 3.6;

  // Total power required = aero drag + rolling resistance proxy
  // Rolling resistance proxy: Crr × mass × g × v  (Crr ≈ 0.004 for race tires)
  const CRR = 0.004;
  const rollingW = CRR * bodyWeightKg * 9.81 * speedMs;
  const requiredPowerW = (0.5 * density * currentCda * Math.pow(speedMs, 3) * tf) + rollingW;

  // Solve for target CdA that brings aero power to achievable level
  // Assume rider can sustain requiredPowerW; find CdA = 2(P - Proll) / (ρ × v³ × tf)
  const aeroPowerBudget = requiredPowerW - rollingW;
  const targetCda = Math.max(
    0.12,
    (2 * aeroPowerBudget) / (density * Math.pow(speedMs, 3) * tf),
  );

  return {
    requiredAvgSpeedKph,
    requiredPowerW,
    targetCda,
    cdaGapM2: currentCda - targetCda,
    achievable: targetCda >= 0.12,
  };
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

// ─── Power Zones ──────────────────────────────────────────────────────────────

export interface PowerZone {
  zone:  number;
  name:  string;
  range: [number, number]; // [min, max] watts
}

export function computePowerZones(ftpW: number): PowerZone[] {
  const z = (lo: number, hi: number) =>
    [Math.round(ftpW * lo), Math.round(ftpW * hi)] as [number, number];
  return [
    { zone: 1, name: "Active Recovery", range: z(0,    0.55) },
    { zone: 2, name: "Endurance",       range: z(0.55, 0.75) },
    { zone: 3, name: "Tempo",           range: z(0.75, 0.90) },
    { zone: 4, name: "Lactate Thresh.", range: z(0.90, 1.05) },
    { zone: 5, name: "VO2 Max",         range: z(1.05, 1.20) },
    { zone: 6, name: "Anaerobic",       range: z(1.20, 1.50) },
    { zone: 7, name: "Neuromuscular",   range: z(1.50, 99.0) },
  ];
}

// ─── Race Pace ────────────────────────────────────────────────────────────────

export interface RacePaceResult {
  requiredSpeedKph:  number;
  estimatedPowerW:   number;
  negativeSplitKph:  number; // first half ~2% slower
}

export function computeRacePace(
  goalTimeSec: number,
  distanceKm:  number,
  cda:         number,
  densityMode: AirDensityMode,
  bodyWeightKg: number,
): RacePaceResult {
  const requiredSpeedKph = (distanceKm / goalTimeSec) * 3600;
  const density = getAirDensity(densityMode);
  const estimatedPowerW = calcAeroPower(cda, requiredSpeedKph, density, false)
    + 0.004 * bodyWeightKg * 9.81 * (requiredSpeedKph / 3.6);
  return {
    requiredSpeedKph,
    estimatedPowerW,
    negativeSplitKph: requiredSpeedKph * 0.98,
  };
}

// ─── Wind Impact ──────────────────────────────────────────────────────────────

export interface WindResult {
  effectiveCda:       number;
  headwindPowerCostW: number;
  timeDeltaSec:       number;
}

export function computeWindImpact(
  baseCda:        number,
  _windSpeedKph:  number,
  yawAngleDeg:    number,
  riderSpeedKph:  number,
  distanceKm:     number,
  densityMode:    AirDensityMode,
): WindResult {
  // Simplified yaw model: effective CdA increases with yaw
  const yawFactor = 1 + (yawAngleDeg / 90) * 0.15;
  const effectiveCda = baseCda * yawFactor;

  const density = getAirDensity(densityMode);
  const basePower = calcAeroPower(baseCda, riderSpeedKph, density, false);
  const windPower = calcAeroPower(effectiveCda, riderSpeedKph, density, false);
  const headwindPowerCostW = windPower - basePower;

  const timeDeltaSec = calcTimeSavingsSec(
    effectiveCda, baseCda, riderSpeedKph, distanceKm, density, false,
  );

  return { effectiveCda, headwindPowerCostW, timeDeltaSec };
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export interface NutritionResult {
  carbsPerHour:  number;
  sodiumPerHour: number; // mg
  fluidPerHour:  number; // ml
  totalCarbsG:   number;
  totalFluidMl:  number;
}

export function computeNutrition(
  bodyWeightKg:  number,
  durationHours: number,
  intensityZone: 2 | 3 | 4, // endurance / tempo / threshold
): NutritionResult {
  const carbsByZone: Record<number, number> = { 2: 60, 3: 75, 4: 90 };
  const carbsPerHour = carbsByZone[intensityZone];
  const sodiumPerHour = Math.round(500 + bodyWeightKg * 5);
  const fluidPerHour  = Math.round(500 + bodyWeightKg * 5);

  return {
    carbsPerHour,
    sodiumPerHour,
    fluidPerHour,
    totalCarbsG:  Math.round(carbsPerHour * durationHours),
    totalFluidMl: Math.round(fluidPerHour  * durationHours),
  };
}
