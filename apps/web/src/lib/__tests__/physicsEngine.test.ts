import { computeRacePlan } from "../physicsEngine";

test("computeRacePlan returns sensible targetCda for 70.3", () => {
  const result = computeRacePlan({
    distanceKm:   90,
    goalTimeSec:  2 * 3600 + 30 * 60, // 2h30m
    currentCda:   0.28,
    densityMode:  "tropical",
    terrain:      "flat",
    bodyWeightKg: 70,
  });

  expect(result.requiredAvgSpeedKph).toBeCloseTo(36, 0);
  expect(result.targetCda).toBeGreaterThan(0.12);
  expect(result.targetCda).toBeLessThan(0.28);
  expect(result.cdaGapM2).toBeGreaterThan(0);
});
