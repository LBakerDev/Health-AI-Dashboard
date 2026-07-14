import type { ReactNode } from 'react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

import { GlassSurface, TrendBadge } from '@shared/ui';
import type { TrendSignal } from '@entities/health-metric';

interface ModuleTileProps {
  actionLabel?: string;
  detail: string;
  disabled?: boolean;
  icon: ComponentType<LucideProps>;
  onClick?: () => void;
  progress?: number;
  progressLabel?: string;
  signal?: 'cardio' | 'fat-loss' | 'recovery';
  title: string;
  trend?: Pick<TrendSignal, 'direction' | 'label' | 'sentiment'>;
  value: ReactNode;
}

export function ModuleTile({
  actionLabel,
  detail,
  disabled = false,
  icon: Icon,
  onClick,
  progress,
  progressLabel,
  signal = 'cardio',
  title,
  trend,
  value,
}: ModuleTileProps) {
  return (
    <GlassSurface
      aria-disabled={disabled || undefined}
      as="button"
      className="module-tile"
      data-signal={signal}
      disabled={disabled}
      interactive={!disabled}
      onClick={onClick}
      tone="solid"
    >
      <div className="module-tile__header">
        <span className="module-tile__title">
          <Icon aria-hidden="true" size={18} strokeWidth={2.1} />
          {title}
        </span>
        {trend ? <TrendBadge trend={trend} /> : null}
      </div>
      <div className="module-tile__value">{value}</div>
      <p>{detail}</p>
      {typeof progress === 'number' ? (
        <div className="module-tile__progress" aria-label={`${progress}% ${progressLabel ?? ''}`}>
          <i style={{ width: `${progress}%` }} />
          {progressLabel ? <span>{progressLabel}</span> : null}
        </div>
      ) : (
        <svg className="module-tile__spark" aria-hidden="true" viewBox="0 0 280 52">
          <path
            d={
              signal === 'cardio'
                ? 'M0 40 L52 36 L98 38 L145 28 L198 26 L240 24 L280 18'
                : 'M0 34 L58 30 L116 36 L176 32 L232 28 L280 31'
            }
          />
        </svg>
      )}
      {actionLabel ? (
        <span className="module-tile__action">
          {actionLabel}
          <ArrowRight size={14} strokeWidth={2.2} />
        </span>
      ) : null}
    </GlassSurface>
  );
}
