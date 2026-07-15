import type { Mvp1DashboardPayload } from '@entities/health-metric';
import { Button } from '@shared/ui/button';
import { ArrowLeft } from '@shared/ui/icons';

import { CardioMetricStrip } from './CardioMetricStrip';
import { CardioTrendCharts } from './CardioTrendCharts';
import { WorkoutList } from './WorkoutList';
import { ZoneDistribution } from './ZoneDistribution';

interface CardioFitnessViewProps {
  onBack: () => void;
  payload: Mvp1DashboardPayload;
}

export function CardioFitnessView({ onBack, payload }: CardioFitnessViewProps) {
  return (
    <section aria-labelledby="cardio-title" className="dashboard-view">
      <Button onClick={onBack} size="sm" variant="ghost">
        <ArrowLeft size={16} strokeWidth={2.2} />
        Weekly Summary
      </Button>
      <div className="view-hero view-hero--detail">
        <div>
          <p className="eyebrow">Cardio Fitness</p>
          <h1 id="cardio-title">Are workouts getting better?</h1>
          <p>Track VO2 max, resting HR, workout heart rate, and time spent in the target zones.</p>
        </div>
      </div>
      <CardioMetricStrip summary={payload.cardioFitness} />
      <CardioTrendCharts summary={payload.cardioFitness} />
      <div className="dashboard-grid dashboard-grid--split">
        <ZoneDistribution zones={payload.cardioFitness.heartRateZones} />
        <WorkoutList workouts={payload.workouts} />
      </div>
    </section>
  );
}
