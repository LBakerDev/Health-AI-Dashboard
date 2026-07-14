import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { CardioFitnessSummary, TimeSeriesPoint } from '@entities/health-metric';
import { formatShortDate } from '@shared/lib';
import { GlassSurface } from '@shared/ui';

interface CardioTrendChartsProps {
  summary: CardioFitnessSummary;
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
  const chartData = data.map((point) => ({
    ...point,
    label: formatShortDate(point.date),
  }));

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
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={chartData} margin={{ bottom: 0, left: -20, right: 4, top: 12 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.32} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--color-border-muted)"
              strokeDasharray="4 8"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="label"
              interval="preserveStartEnd"
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis axisLine={false} tick={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-strong)',
                border: '1px solid var(--glass-border)',
                borderRadius: 16,
                boxShadow: 'var(--shadow-glass)',
                color: 'var(--color-ink)',
              }}
            />
            <Area
              activeDot={{ r: 5 }}
              dataKey="value"
              fill={`url(#${gradientId})`}
              stroke={color}
              strokeWidth={3}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
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
