# MVP1 Data Contract

MVP1 uses one compact dashboard payload after parsing and deduplication. The browser UI should not parse raw Apple Health XML records. It consumes the typed payload exported by `@entities/health-metric`.

## Public Type

```ts
import type { Mvp1DashboardPayload } from '@entities/health-metric';
```

The mock implementation lives at:

```ts
import { mvp1DashboardPayload } from '@data/mock';
```

## Payload Shape

```text
Mvp1DashboardPayload
  schemaVersion
  generatedAt
  importSummary
  weeklySummary
  cardioFitness
  workouts
  insight
```

## Parser Responsibilities

The parser or adapter owns:

- reading `export.zip` / `export.xml`
- extracting only MVP1 record types
- deduplicating overlapping sources
- aggregating daily and weekly rollups
- producing `Mvp1DashboardPayload`

The parser must not rely on the AI layer for calculations.

## UI Responsibilities

The React UI owns:

- rendering the sample payload before import
- rendering imported payloads with the same component contract
- showing import, parsing, ready, empty, and error states
- formatting numbers, units, trends, and chart labels
- drilling from Weekly Summary into Cardio Fitness detail

The UI should not infer missing metrics silently. If a metric is unavailable, the parser should return `null` for nullable metrics such as `vo2Max`, `restingHeartRate`, and `weightTrend`.

## AI Insight Rule

The AI insight layer narrates deterministic numbers. It does not compute them.

`WeeklyInsight.evidenceMetricIds` must reference metric IDs that exist in the payload, such as:

- `weekly.steps.avg`
- `weekly.weight.avg`
- `cardio.vo2max.current`
- `cardio.rhr.current`
- `cardio.zone23.minutes`

This lets the UI show evidence chips and lets tests catch hallucinated or stale metric references.

## MVP1 Source Priority

When duplicate records overlap, the parser should prefer:

```text
peloton -> apple-watch -> iphone -> manual -> sample
```

This priority is also stored in `importSummary.sourcePriority` so the UI can explain data trust without exposing raw records.

## Current Mock Facts

The sample payload models the MVP1 PRD and refined prototype:

- 5,200 average steps/day
- 3 cardio sessions and 1 strength session
- 42 minutes in heart-rate Zone 2/3
- VO2 max at 38.1, up 1.4 over the trend window
- resting HR at 54 bpm, down 2 bpm
- weight at 178.4 lb, down 0.6 lb
