import type { HTMLAttributes } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import type { TrendSignal } from '@entities/health-metric';
import { cn } from '@shared/lib';

interface TrendBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  trend: Pick<TrendSignal, 'direction' | 'label' | 'sentiment'>;
}

const directionIcon = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
} satisfies Record<TrendSignal['direction'], typeof ArrowUp>;

export function TrendBadge({ className, trend, ...props }: TrendBadgeProps) {
  const Icon = directionIcon[trend.direction];

  return (
    <span className={cn('trend-badge', className)} data-sentiment={trend.sentiment} {...props}>
      <Icon aria-hidden="true" size={12} strokeWidth={2.3} />
      {trend.label}
    </span>
  );
}
