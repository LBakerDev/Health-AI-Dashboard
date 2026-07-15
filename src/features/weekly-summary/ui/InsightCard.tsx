import type { Mvp1DashboardPayload } from '@entities/health-metric';
import { formatMetricValue } from '@shared/lib';
import { GlassSurface } from '@shared/ui/glass-surface';
import { Brain, CheckCircle2 } from '@shared/ui/icons';

interface InsightCardProps {
  payload: Mvp1DashboardPayload;
}

export function InsightCard({ payload }: InsightCardProps) {
  const evidenceCount = payload.insight.evidenceMetricIds.length;
  const restingHeartRate = payload.cardioFitness.metrics.restingHeartRate;
  const weightTrend = payload.weeklySummary.metrics.weightTrend;
  const workouts = payload.weeklySummary.metrics.workoutSessions;
  const zoneMinutes = payload.cardioFitness.metrics.zoneTwoThreeMinutes;
  const evidenceMetrics = [
    {
      label: 'Resting HR (bpm)',
      value: restingHeartRate?.trend?.delta
        ? `▼ ${Math.abs(restingHeartRate.trend.delta)}`
        : `${restingHeartRate?.value ?? '--'}`,
    },
    {
      label: 'Weight (lb)',
      value: weightTrend?.trend?.delta ? `▼ ${Math.abs(weightTrend.trend.delta)}` : '--',
    },
    {
      label: 'Cardio sessions',
      value: formatMetricValue(workouts),
    },
    {
      label: 'Zone 2/3 (min)',
      value: formatMetricValue(zoneMinutes),
    },
  ];

  return (
    <GlassSurface className="insight-card" tone="insight">
      <div className="insight-card__eyebrow">
        <Brain size={15} strokeWidth={2.1} />
        Weekly insight
      </div>
      <div className="insight-card__content">
        <div>
          <p className="insight-card__status">
            <span aria-hidden="true" />
            {payload.insight.title}
          </p>
          <div className="insight-card__metrics" aria-label="Insight evidence metrics">
            {evidenceMetrics.map((metric) => (
              <div className="insight-card__metric" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
          <p className="insight-card__body">{payload.insight.body}</p>
        </div>
      </div>
      <p className="insight-card__note">
        <CheckCircle2 size={14} strokeWidth={2.2} />
        Narrated from deterministic stats, using {evidenceCount} evidence metrics.
      </p>
    </GlassSurface>
  );
}
