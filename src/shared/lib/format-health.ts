import type { HealthMetric, MetricUnit, WorkoutType } from '@entities/health-metric';

const unitLabels = {
  steps: '',
  kcal: 'kcal',
  sessions: 'sessions',
  lb: 'lb',
  bpm: 'bpm',
  min: 'min',
  ms: 'ms',
  hours: 'h',
  'ml/kg/min': 'VO2 max',
  percent: '%',
} satisfies Record<MetricUnit, string>;

const workoutLabels = {
  basketball: 'Basketball',
  peloton: 'Peloton',
  strength: 'Strength',
  walk: 'Walk',
  other: 'Other',
} satisfies Record<WorkoutType, string>;

export function formatNumber(value: number, precision = 0) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  }).format(value);
}

export function formatMetricValue(metric: HealthMetric) {
  return formatNumber(metric.value, metric.precision ?? 0);
}

export function formatMetricUnit(unit: MetricUnit) {
  return unitLabels[unit];
}

export function formatWorkoutType(type: WorkoutType) {
  return workoutLabels[type];
}

export function formatShortDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(`${isoDate}T00:00:00`),
  );
}

export function formatWeekday(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(
    new Date(`${isoDate}T00:00:00`),
  );
}

export function formatTime(isoDateTime: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDateTime));
}
