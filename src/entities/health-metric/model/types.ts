export type TrendDirection = 'up' | 'down' | 'flat';
export type TrendSentiment = 'good' | 'neutral' | 'bad';
export type InsightConfidence = 'low' | 'medium' | 'high';
export type ImportMode = 'sample' | 'apple-health-export';
export type ImportStatus = 'sample' | 'idle' | 'parsing' | 'ready' | 'error';
export type MetricUnit =
  'steps' | 'kcal' | 'sessions' | 'lb' | 'bpm' | 'min' | 'ms' | 'hours' | 'ml/kg/min' | 'percent';
export type WorkoutType = 'basketball' | 'peloton' | 'strength' | 'walk' | 'other';
export type SourceSystem = 'apple-watch' | 'iphone' | 'peloton' | 'manual' | 'sample';

export interface DateRange {
  start: string;
  end: string;
  label: string;
}

export interface TrendSignal {
  direction: TrendDirection;
  sentiment: TrendSentiment;
  label: string;
  delta: number;
  unit: MetricUnit;
}

export interface HealthMetric {
  id: string;
  label: string;
  value: number;
  unit: MetricUnit;
  precision?: number;
  comparisonLabel?: string;
  trend?: TrendSignal;
}

export interface DailyActivityPoint {
  date: string;
  steps: number;
  activeCalories: number;
  workoutMinutes: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface WeeklySummary {
  week: DateRange;
  headline: string;
  metrics: {
    averageStepsPerDay: HealthMetric;
    activeCalories: HealthMetric;
    workoutSessions: HealthMetric;
    weightTrend: HealthMetric | null;
  };
  dailyActivity: DailyActivityPoint[];
}

export interface CardioFitnessSummary {
  metrics: {
    averageWorkoutHeartRate: HealthMetric;
    zoneTwoThreeMinutes: HealthMetric;
    vo2Max: HealthMetric | null;
    restingHeartRate: HealthMetric | null;
  };
  vo2MaxTrend: TimeSeriesPoint[];
  restingHeartRateTrend: TimeSeriesPoint[];
  heartRateZones: HeartRateZone[];
}

export interface HeartRateZone {
  zone: 1 | 2 | 3 | 4 | 5;
  label: string;
  minutes: number;
  target: boolean;
}

export interface WorkoutSession {
  id: string;
  startedAt: string;
  type: WorkoutType;
  label: string;
  durationMinutes: number;
  activeCalories: number;
  averageHeartRate: number | null;
  maxHeartRate: number | null;
  source: SourceSystem;
}

export interface DataQualitySignal {
  id: string;
  label: string;
  status: TrendSentiment;
  detail: string;
}

export interface ImportSummary {
  mode: ImportMode;
  status: ImportStatus;
  sourceLabel: string;
  importedAt: string | null;
  recordsRead: number;
  recordsDeduplicated: number;
  sourcePriority: SourceSystem[];
  dataQuality: DataQualitySignal[];
}

export interface WeeklyInsight {
  title: string;
  body: string;
  confidence: InsightConfidence;
  evidenceMetricIds: string[];
  generatedFrom: 'deterministic-stats' | 'llm-narration';
}

export interface Mvp1DashboardPayload {
  schemaVersion: 'mvp1.0';
  generatedAt: string;
  importSummary: ImportSummary;
  weeklySummary: WeeklySummary;
  cardioFitness: CardioFitnessSummary;
  workouts: WorkoutSession[];
  insight: WeeklyInsight;
}
