import type { Mvp1DashboardPayload } from '@entities/health-metric';
import {
  Activity,
  Flame,
  Footprints,
  HeartPulse,
  Moon,
  Scale,
  TrendingDown,
} from '@shared/ui/icons';

import { InsightCard } from './InsightCard';
import { MetricCard } from './MetricCard';
import { ModuleTile } from './ModuleTile';

interface WeeklySummaryViewProps {
  onOpenCardio: () => void;
  payload: Mvp1DashboardPayload;
}

export function WeeklySummaryView({ onOpenCardio, payload }: WeeklySummaryViewProps) {
  const metrics = payload.weeklySummary.metrics;
  const cardio = payload.cardioFitness.metrics;

  return (
    <section aria-labelledby="weekly-summary-title" className="dashboard-view">
      <div className="view-hero">
        <div>
          <h1 id="weekly-summary-title">This week at a glance</h1>
          <p>Is conditioning improving and are you on track to lose fat?</p>
        </div>
      </div>

      <InsightCard payload={payload} />

      <div className="metric-grid">
        <MetricCard
          dailyActivity={payload.weeklySummary.dailyActivity}
          icon={Footprints}
          metric={metrics.averageStepsPerDay}
          visual="steps"
        />
        <MetricCard
          dailyActivity={payload.weeklySummary.dailyActivity}
          icon={Flame}
          metric={metrics.activeCalories}
          visual="calories"
        />
        <MetricCard
          icon={Activity}
          metric={metrics.workoutSessions}
          visual="workouts"
          workouts={payload.workouts}
        />
        {metrics.weightTrend ? (
          <MetricCard icon={Scale} metric={metrics.weightTrend} visual="weight" />
        ) : null}
      </div>

      <div className="module-section">
        <p className="eyebrow">Modules</p>
        <div className="module-stack" aria-label="MVP modules">
          <ModuleTile
            actionLabel="Open detail"
            detail={`RHR ${cardio.restingHeartRate?.value ?? '--'} bpm · ${
              cardio.zoneTwoThreeMinutes.value
            } min Zone 2/3`}
            icon={HeartPulse}
            onClick={onOpenCardio}
            signal="cardio"
            title="Cardio Fitness"
            trend={cardio.vo2Max?.trend}
            value={
              <>
                {cardio.vo2Max?.value ?? '--'} <span>VO2 max</span>
              </>
            }
          />
          <ModuleTile
            detail="on track for goal"
            icon={TrendingDown}
            progress={82}
            progressLabel="Weekly adherence score"
            signal="fat-loss"
            title="Fat-Loss Progress"
            trend={{
              direction: 'flat',
              label: '82% adherence',
              sentiment: 'good',
            }}
            value={
              <>
                -2.1 <span>lb / 4 wk</span>
              </>
            }
          />
          <ModuleTile
            detail="7.4 h sleep avg · load moderate"
            icon={Moon}
            signal="recovery"
            title="Recovery"
            trend={{
              direction: 'flat',
              label: 'steady',
              sentiment: 'neutral',
            }}
            value={
              <>
                48 <span>ms HRV</span>
              </>
            }
          />
        </div>
      </div>

      <p className="data-footnote">{buildDataFootnote(payload)}</p>
    </section>
  );
}

function buildDataFootnote(payload: Mvp1DashboardPayload) {
  if (payload.importSummary.status === 'sample' || !payload.importSummary.importedAt) {
    return 'Sample data is active · import Apple Health to replace it · never uploaded';
  }

  const importDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(payload.importSummary.importedAt));

  return `Data parsed locally from ${payload.importSummary.sourceLabel} · never uploaded · imported ${importDate}`;
}
