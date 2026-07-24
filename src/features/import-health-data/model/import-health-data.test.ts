import { describe, expect, it } from 'vitest';

import { importHealthDataFile, parseAppleHealthExportXml } from './import-health-data';

const appleHealthXml = `<?xml version="1.0" encoding="UTF-8"?>
<HealthData locale="en_US">
  <Record type="HKQuantityTypeIdentifierStepCount" sourceName="London's Apple Watch" unit="count" creationDate="2026-06-20 12:00:00 -0400" startDate="2026-06-20 09:00:00 -0400" endDate="2026-06-20 09:30:00 -0400" value="7000" />
  <Record type="HKQuantityTypeIdentifierStepCount" sourceName="London's iPhone" unit="count" creationDate="2026-06-20 12:00:00 -0400" startDate="2026-06-20 09:00:00 -0400" endDate="2026-06-20 09:30:00 -0400" value="7000" />
  <Record type="HKQuantityTypeIdentifierStepCount" sourceName="London's iPhone" unit="count" creationDate="2026-06-10 12:00:00 -0400" startDate="2026-06-10 09:00:00 -0400" endDate="2026-06-10 09:30:00 -0400" value="5600" />
  <Record type="HKQuantityTypeIdentifierActiveEnergyBurned" sourceName="London's Apple Watch" unit="Cal" creationDate="2026-06-20 12:00:00 -0400" startDate="2026-06-20 09:00:00 -0400" endDate="2026-06-20 09:30:00 -0400" value="300" />
  <Record type="HKQuantityTypeIdentifierBodyMass" sourceName="Manual" unit="lb" creationDate="2026-06-20 08:00:00 -0400" startDate="2026-06-20 08:00:00 -0400" endDate="2026-06-20 08:00:00 -0400" value="178.2" />
  <Record type="HKQuantityTypeIdentifierBodyMass" sourceName="Manual" unit="lb" creationDate="2026-06-10 08:00:00 -0400" startDate="2026-06-10 08:00:00 -0400" endDate="2026-06-10 08:00:00 -0400" value="179.1" />
  <Record type="HKQuantityTypeIdentifierRestingHeartRate" sourceName="London's Apple Watch" unit="count/min" creationDate="2026-06-20 08:00:00 -0400" startDate="2026-06-20 08:00:00 -0400" endDate="2026-06-20 08:00:00 -0400" value="54" />
  <Record type="HKQuantityTypeIdentifierRestingHeartRate" sourceName="London's Apple Watch" unit="count/min" creationDate="2026-06-10 08:00:00 -0400" startDate="2026-06-10 08:00:00 -0400" endDate="2026-06-10 08:00:00 -0400" value="56" />
  <Record type="HKQuantityTypeIdentifierVO2Max" sourceName="London's Apple Watch" unit="mL/kg*min" creationDate="2026-06-20 08:00:00 -0400" startDate="2026-06-20 08:00:00 -0400" endDate="2026-06-20 08:00:00 -0400" value="38.1" />
  <Record type="HKQuantityTypeIdentifierHeartRate" sourceName="London's Apple Watch" unit="count/min" creationDate="2026-06-20 09:15:00 -0400" startDate="2026-06-20 09:15:00 -0400" endDate="2026-06-20 09:15:00 -0400" value="148" />
  <Workout workoutActivityType="HKWorkoutActivityTypeBasketball" duration="40" durationUnit="min" totalEnergyBurned="240" totalEnergyBurnedUnit="Cal" sourceName="London's Apple Watch" startDate="2026-06-20 09:00:00 -0400" endDate="2026-06-20 09:40:00 -0400" />
</HealthData>`;

describe('Apple Health import parser', () => {
  it('aggregates MVP1 weekly metrics from Apple Health XML', () => {
    const payload = parseAppleHealthExportXml(appleHealthXml, {
      fileName: 'export.xml',
      importedAt: '2026-06-22T12:00:00.000Z',
    });

    expect(payload.importSummary.status).toBe('ready');
    expect(payload.importSummary.sourceLabel).toBe('export.xml');
    expect(payload.importSummary.recordsDeduplicated).toBe(1);
    expect(payload.weeklySummary.week.label).toBe('Week of Jun 15-21, 2026');
    expect(payload.weeklySummary.metrics.averageStepsPerDay.value).toBe(1000);
    expect(payload.weeklySummary.metrics.activeCalories.value).toBe(540);
    expect(payload.weeklySummary.metrics.weightTrend?.value).toBe(178.2);
    expect(payload.cardioFitness.metrics.restingHeartRate?.trend?.sentiment).toBe('good');
    expect(payload.workouts).toHaveLength(1);
  });

  it('returns a clear next-step message for zip archives', async () => {
    const file = new File([new Uint8Array([80, 75])], 'export.zip', { type: 'application/zip' });

    await expect(importHealthDataFile(file, () => undefined)).rejects.toThrow(
      /choose export\.xml/i,
    );
  });
});
