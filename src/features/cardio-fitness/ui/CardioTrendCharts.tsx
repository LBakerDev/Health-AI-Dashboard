import type { CardioFitnessSummary, TimeSeriesPoint } from '@entities/health-metric';
import { formatShortDate } from '@shared/lib';
import { GlassSurface } from '@shared/ui/glass-surface';

interface CardioTrendChartsProps {
  summary: CardioFitnessSummary;
}

const chartWidth = 360;
const chartHeight = 190;
const chartPadding = {
  bottom: 28,
  left: 8,
  right: 8,
  top: 18,
};

function buildTrendPoints(data: TimeSeriesPoint[]) {
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const drawableWidth = chartWidth - chartPadding.left - chartPadding.right;
  const drawableHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  return data.map((point, index) => {
    const x = chartPadding.left + (index / Math.max(data.length - 1, 1)) * drawableWidth;
    const y = chartPadding.top + drawableHeight - ((point.value - min) / range) * drawableHeight;

    return {
      ...point,
      label: formatShortDate(point.date),
      x,
      y,
    };
  });
}

function toLinePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(' ');
}

function TrendChart({
  color,
  data,
  helper,
  gradientId,
  title,
  valueLabel,
}: {
  color: string;
  data: TimeSeriesPoint[];
  gradientId: string;
  helper: string;
  title: string;
  valueLabel: string;
}) {
  const points = buildTrendPoints(data);
  const linePath = toLinePath(points);
  const areaPath = `${linePath} L ${points.at(-1)?.x.toFixed(1) ?? chartPadding.left} ${
    chartHeight - chartPadding.bottom
  } L ${points[0]?.x.toFixed(1) ?? chartPadding.left} ${chartHeight - chartPadding.bottom} Z`;
  const firstPoint = points[0];
  const lastPoint = points.at(-1);

  return (
    <GlassSurface className="chart-panel" tone="solid">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>{valueLabel}</h2>
        </div>
        <p>{helper}</p>
      </div>
      <div className="trend-chart" aria-label={`${title} trend chart`}>
        <svg role="img" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <title>{`${title}: ${valueLabel}`}</title>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.34} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((line) => {
            const y =
              chartPadding.top +
              (line / 2) * (chartHeight - chartPadding.top - chartPadding.bottom);

            return (
              <line
                className="chart-grid-line"
                key={line}
                x1={chartPadding.left}
                x2={chartWidth - chartPadding.right}
                y1={y}
                y2={y}
              />
            );
          })}
          <path className="chart-area" d={areaPath} fill={`url(#${gradientId})`} />
          <path className="chart-line" d={linePath} stroke={color} />
          {lastPoint ? (
            <circle
              className="chart-point"
              cx={lastPoint.x}
              cy={lastPoint.y}
              fill={color}
              r="4.5"
            />
          ) : null}
          {firstPoint ? (
            <text className="chart-axis-label" x={firstPoint.x} y={chartHeight - 6}>
              {firstPoint.label}
            </text>
          ) : null}
          {lastPoint ? (
            <text
              className="chart-axis-label chart-axis-label--end"
              x={lastPoint.x}
              y={chartHeight - 6}
            >
              {lastPoint.label}
            </text>
          ) : null}
        </svg>
      </div>
    </GlassSurface>
  );
}

export function CardioTrendCharts({ summary }: CardioTrendChartsProps) {
  const vo2 = summary.metrics.vo2Max;
  const rhr = summary.metrics.restingHeartRate;

  return (
    <div className="dashboard-grid dashboard-grid--two">
      <TrendChart
        color="var(--color-fitness)"
        data={summary.vo2MaxTrend}
        gradientId="vo2-gradient"
        helper={vo2?.comparisonLabel ?? 'Trend window'}
        title="VO2 Max - 12 weeks"
        valueLabel={vo2 ? `${vo2.value.toFixed(1)} mL/kg/min` : 'Not enough data'}
      />
      <TrendChart
        color="var(--color-cardio)"
        data={summary.restingHeartRateTrend}
        gradientId="rhr-gradient"
        helper={rhr?.comparisonLabel ?? 'Trend window'}
        title="Resting HR - 12 weeks"
        valueLabel={rhr ? `${rhr.value} bpm` : 'Not enough data'}
      />
    </div>
  );
}
