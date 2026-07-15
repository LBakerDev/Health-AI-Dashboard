import { useMemo, useState } from 'react';

import type { WorkoutSession, WorkoutType } from '@entities/health-metric';
import { formatTime, formatWorkoutType } from '@shared/lib';
import { GlassSurface } from '@shared/ui/glass-surface';
import { Dumbbell, Timer } from '@shared/ui/icons';
import { SegmentedControl } from '@shared/ui/segmented-control';

interface WorkoutListProps {
  workouts: WorkoutSession[];
}

type WorkoutFilter = 'all' | Extract<WorkoutType, 'basketball' | 'peloton'>;

export function WorkoutList({ workouts }: WorkoutListProps) {
  const [filter, setFilter] = useState<WorkoutFilter>('all');
  const filteredWorkouts = useMemo(
    () => workouts.filter((workout) => filter === 'all' || workout.type === filter),
    [filter, workouts],
  );

  return (
    <GlassSurface className="workout-panel" tone="solid">
      <div className="panel-heading panel-heading--inline">
        <div>
          <p className="eyebrow">Workout detail</p>
          <h2>Sessions this week</h2>
        </div>
        <SegmentedControl
          ariaLabel="Workout filter"
          onValueChange={setFilter}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Peloton', value: 'peloton' },
            { label: 'Basketball', value: 'basketball' },
          ]}
          value={filter}
        />
      </div>
      <div className="workout-list">
        {filteredWorkouts.map((workout) => (
          <article className="workout-row" key={workout.id}>
            <span className="workout-row__icon" aria-hidden="true">
              <Dumbbell size={17} strokeWidth={2.1} />
            </span>
            <div>
              <h3>{workout.label}</h3>
              <p>
                {formatWorkoutType(workout.type)} · {formatTime(workout.startedAt)}
              </p>
            </div>
            <div className="workout-row__meta">
              <span>
                <Timer size={14} strokeWidth={2.1} />
                {workout.durationMinutes} min
              </span>
              <strong>{workout.averageHeartRate ?? '--'} bpm avg</strong>
            </div>
          </article>
        ))}
      </div>
    </GlassSurface>
  );
}
