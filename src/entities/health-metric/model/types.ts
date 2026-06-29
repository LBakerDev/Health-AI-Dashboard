export type TrendDirection = 'up' | 'down' | 'flat';
export type TrendSentiment = 'good' | 'neutral' | 'bad';

export interface TrendSignal {
  direction: TrendDirection;
  sentiment: TrendSentiment;
  label: string;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  averageStepsPerDay: number;
  activeCalories: number;
  workoutSessions: number;
  weightTrendLbs: number | null;
}

export interface CardioFitnessSummary {
  averageWorkoutHeartRate: number;
  zoneTwoThreeMinutes: number;
  vo2Max: number | null;
  restingHeartRate: number | null;
}

export interface WeeklyInsight {
  title: string;
  body: string;
  confidence: 'low' | 'medium' | 'high';
  evidenceMetricIds: string[];
}
