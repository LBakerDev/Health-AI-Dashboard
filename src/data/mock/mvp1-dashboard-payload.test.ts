import { describe, expect, it } from 'vitest';

import { mvp1DashboardPayload } from './mvp1-dashboard-payload';

function getMetricIds() {
  const weeklyMetrics = Object.values(mvp1DashboardPayload.weeklySummary.metrics);
  const cardioMetrics = Object.values(mvp1DashboardPayload.cardioFitness.metrics);

  return [...weeklyMetrics, ...cardioMetrics]
    .filter((metric) => metric !== null)
    .map((metric) => metric.id);
}

describe('mvp1DashboardPayload', () => {
  it('uses the MVP1 schema version', () => {
    expect(mvp1DashboardPayload.schemaVersion).toBe('mvp1.0');
  });

  it('keeps AI insight evidence tied to real metric ids', () => {
    const metricIds = new Set(getMetricIds());

    expect(mvp1DashboardPayload.insight.evidenceMetricIds).not.toHaveLength(0);

    for (const evidenceMetricId of mvp1DashboardPayload.insight.evidenceMetricIds) {
      expect(metricIds.has(evidenceMetricId)).toBe(true);
    }
  });

  it('keeps zone 2/3 minutes aligned with the cardio metric', () => {
    const targetZoneMinutes = mvp1DashboardPayload.cardioFitness.heartRateZones
      .filter((zone) => zone.target)
      .reduce((total, zone) => total + zone.minutes, 0);

    expect(targetZoneMinutes).toBe(
      mvp1DashboardPayload.cardioFitness.metrics.zoneTwoThreeMinutes.value,
    );
  });

  it('keeps weekly workout count aligned with workout sessions', () => {
    expect(mvp1DashboardPayload.workouts).toHaveLength(
      mvp1DashboardPayload.weeklySummary.metrics.workoutSessions.value,
    );
  });

  it('keeps import metadata credible for sample mode', () => {
    expect(mvp1DashboardPayload.importSummary.status).toBe('sample');
    expect(mvp1DashboardPayload.importSummary.recordsRead).toBeGreaterThan(0);
    expect(mvp1DashboardPayload.importSummary.recordsDeduplicated).toBeGreaterThan(0);
    expect(mvp1DashboardPayload.importSummary.recordsRead).toBeGreaterThan(
      mvp1DashboardPayload.importSummary.recordsDeduplicated,
    );
  });
});
