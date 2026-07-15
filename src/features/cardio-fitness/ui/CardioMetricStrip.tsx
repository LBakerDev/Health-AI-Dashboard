import type { CardioFitnessSummary, HealthMetric } from '@entities/health-metric';
import { formatMetricUnit, formatMetricValue } from '@shared/lib';
import { GlassSurface } from '@shared/ui/glass-surface';
import { Activity, HeartPulse, Timer, Waves } from '@shared/ui/icons';
import { TrendBadge } from '@shared/ui/trend-badge';

const iconByMetricId = {
  'cardio.workoutHr.avg': Activity,
  'cardio.zone23.minutes': Timer,
  'cardio.vo2max.current': Waves,
  'cardio.rhr.current': HeartPulse,
};

interface CardioMetricStripProps {
  summary: CardioFitnessSummary;
}

function CardioMetric({ metric }: { metric: HealthMetric }) {
  const Icon = iconByMetricId[metric.id as keyof typeof iconByMetricId] ?? Activity;
  const unit = formatMetricUnit(metric.unit);

  return (
    <div className="cardio-stat">
      <span className="cardio-stat__icon" aria-hidden="true">
        <Icon size={17} strokeWidth={2.1} />
      </span>
      <span className="cardio-stat__label">{metric.label}</span>
      <strong>
        {formatMetricValue(metric)}
        {unit ? <span>{unit}</span> : null}
      </strong>
      {metric.trend ? <TrendBadge trend={metric.trend} /> : null}
    </div>
  );
}

export function CardioMetricStrip({ summary }: CardioMetricStripProps) {
  const metrics = Object.values(summary.metrics).filter((metric) => metric !== null);

  return (
    <GlassSurface className="cardio-strip" tone="solid">
      {metrics.map((metric) => (
        <CardioMetric key={metric.id} metric={metric} />
      ))}
    </GlassSurface>
  );
}
