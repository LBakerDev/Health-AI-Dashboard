import type { DailyActivityPoint } from '@entities/health-metric';
import { formatWeekday } from '@shared/lib';
import { GlassSurface } from '@shared/ui/glass-surface';

interface WeeklyActivityChartProps {
  points: DailyActivityPoint[];
}

const activityChartWidth = 420;
const activityChartHeight = 220;
const activityChartPadding = {
  bottom: 30,
  left: 10,
  right: 10,
  top: 18,
};

function toLinePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(' ');
}

export function WeeklyActivityChart({ points }: WeeklyActivityChartProps) {
  const data = points.map((point) => ({
    ...point,
    day: formatWeekday(point.date),
  }));
  const stepsMax = Math.max(...data.map((point) => point.steps));
  const calories = data.map((point) => point.activeCalories);
  const caloriesMin = Math.min(...calories);
  const caloriesMax = Math.max(...calories);
  const caloriesRange = caloriesMax - caloriesMin || 1;
  const drawableWidth = activityChartWidth - activityChartPadding.left - activityChartPadding.right;
  const drawableHeight =
    activityChartHeight - activityChartPadding.top - activityChartPadding.bottom;
  const bandWidth = drawableWidth / Math.max(data.length, 1);
  const barWidth = Math.min(34, bandWidth * 0.54);
  const caloriePoints = data.map((point, index) => {
    const x = activityChartPadding.left + index * bandWidth + bandWidth / 2;
    const y =
      activityChartPadding.top +
      drawableHeight -
      ((point.activeCalories - caloriesMin) / caloriesRange) * drawableHeight;

    return { x, y };
  });
  const caloriePath = toLinePath(caloriePoints);

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
        <svg role="img" viewBox={`0 0 ${activityChartWidth} ${activityChartHeight}`}>
          <title>Daily steps and active calories across the week</title>
          {[0, 1, 2].map((line) => {
            const y =
              activityChartPadding.top +
              (line / 2) *
                (activityChartHeight - activityChartPadding.top - activityChartPadding.bottom);

            return (
              <line
                className="chart-grid-line"
                key={line}
                x1={activityChartPadding.left}
                x2={activityChartWidth - activityChartPadding.right}
                y1={y}
                y2={y}
              />
            );
          })}
          {data.map((point, index) => {
            const x = activityChartPadding.left + index * bandWidth + (bandWidth - barWidth) / 2;
            const barHeight = Math.max(18, (point.steps / stepsMax) * drawableHeight);
            const y = activityChartPadding.top + drawableHeight - barHeight;

            return (
              <g key={point.date}>
                <rect
                  className="chart-bar"
                  height={barHeight}
                  rx="8"
                  width={barWidth}
                  x={x}
                  y={y}
                />
                <text
                  className="chart-axis-label chart-axis-label--center"
                  x={x + barWidth / 2}
                  y={activityChartHeight - 7}
                >
                  {point.day}
                </text>
              </g>
            );
          })}
          <path className="chart-line chart-line--energy" d={caloriePath} />
        </svg>
      </div>
    </GlassSurface>
  );
}
