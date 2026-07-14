import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { DailyActivityPoint } from '@entities/health-metric';
import { formatWeekday } from '@shared/lib';
import { GlassSurface } from '@shared/ui';

interface WeeklyActivityChartProps {
  points: DailyActivityPoint[];
}

const chartDataKey = {
  steps: 'steps',
  activeCalories: 'activeCalories',
} as const;

export function WeeklyActivityChart({ points }: WeeklyActivityChartProps) {
  const data = points.map((point) => ({
    ...point,
    day: formatWeekday(point.date),
  }));

  return (
    <GlassSurface className="chart-panel" tone="solid">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Daily pattern</p>
          <h2>Activity rhythm</h2>
        </div>
        <p>Steps and active calories across the week.</p>
      </div>
      <div className="activity-chart" aria-label="Daily steps and active calories chart">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={data} margin={{ bottom: 0, left: -18, right: 0, top: 14 }}>
            <CartesianGrid
              stroke="var(--color-border-muted)"
              strokeDasharray="4 8"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="day"
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
              cursor={{ fill: 'rgba(79, 110, 247, 0.08)' }}
            />
            <Bar
              dataKey={chartDataKey.steps}
              fill="var(--color-cardio)"
              name="Steps"
              radius={[8, 8, 4, 4]}
            />
            <Line
              dataKey={chartDataKey.activeCalories}
              dot={false}
              name="Active calories"
              stroke="var(--color-energy)"
              strokeWidth={3}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassSurface>
  );
}
