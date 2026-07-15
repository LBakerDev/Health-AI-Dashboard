import type { DailyActivityPoint, HealthMetric, WorkoutSession } from '@entities/health-metric';
import { formatMetricUnit, formatMetricValue } from '@shared/lib';
import { GlassSurface } from '@shared/ui/glass-surface';
import type { LucideIcon } from '@shared/ui/icons';
import { TrendBadge } from '@shared/ui/trend-badge';

interface MetricCardProps {
  dailyActivity?: DailyActivityPoint[];
  icon: LucideIcon;
  metric: HealthMetric;
  visual?: 'steps' | 'calories' | 'workouts' | 'weight';
  workouts?: WorkoutSession[];
}

function buildLinePath(values: number[]) {
  const width = 210;
  const height = 44;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function MetricVisual({
  dailyActivity,
  visual,
  workouts = [],
}: Pick<MetricCardProps, 'dailyActivity' | 'visual' | 'workouts'>) {
  if (visual === 'steps' && dailyActivity) {
    const path = buildLinePath(dailyActivity.map((point) => point.steps));

    return (
      <svg className="metric-card__spark metric-card__spark--line" viewBox="0 0 210 52">
        <path d={path} />
      </svg>
    );
  }

  if (visual === 'calories' && dailyActivity) {
    const values = dailyActivity.map((point) => point.activeCalories);
    const max = Math.max(...values);

    return (
      <div className="metric-card__spark metric-card__spark--bars" aria-hidden="true">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            style={{ height: `${Math.max(26, (value / max) * 58)}px` }}
          />
        ))}
      </div>
    );
  }

  if (visual === 'weight') {
    const path = buildLinePath([179.1, 178.8, 178.9, 178.4, 178.3, 178, 177.8]);

    return (
      <svg className="metric-card__spark metric-card__spark--weight" viewBox="0 0 210 52">
        <path d={path} />
      </svg>
    );
  }

  if (visual === 'workouts') {
    const pelotonCount = workouts.filter((workout) => workout.type === 'peloton').length;
    const basketballCount = workouts.filter((workout) => workout.type === 'basketball').length;

    return (
      <div className="metric-card__chips" aria-hidden="true">
        <span>Peloton x{pelotonCount}</span>
        <span>Basketball x{basketballCount}</span>
      </div>
    );
  }

  return null;
}

export function MetricCard({
  dailyActivity,
  icon: Icon,
  metric,
  visual,
  workouts,
}: MetricCardProps) {
  const unit = formatMetricUnit(metric.unit);

  return (
    <GlassSurface className="metric-card" tone="solid">
      <div className="metric-card__header">
        <span className="metric-card__label">
          <span className="metric-card__icon" aria-hidden="true">
            <Icon size={17} strokeWidth={2.1} />
          </span>
          {metric.label}
        </span>
        {metric.trend ? <TrendBadge trend={metric.trend} /> : null}
      </div>
      <div className="metric-card__value">
        {formatMetricValue(metric)}
        {unit ? <span>{unit}</span> : null}
      </div>
      {metric.comparisonLabel ? (
        <p className="metric-card__support">{metric.comparisonLabel}</p>
      ) : null}
      <MetricVisual dailyActivity={dailyActivity} visual={visual} workouts={workouts} />
    </GlassSurface>
  );
}
