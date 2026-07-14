import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@shared/lib';

type GlassSurfaceTone = 'default' | 'solid' | 'subtle' | 'insight';

type GlassSurfaceProps<TElement extends ElementType> = {
  as?: TElement;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  tone?: GlassSurfaceTone;
} & Omit<ComponentPropsWithoutRef<TElement>, 'as' | 'children' | 'className'>;

export function GlassSurface<TElement extends ElementType = 'section'>({
  as,
  children,
  className,
  interactive = false,
  tone = 'default',
  ...props
}: GlassSurfaceProps<TElement>) {
  const Component = as ?? 'section';

  return (
    <Component
      className={cn('glass-surface', className)}
      data-interactive={interactive ? 'true' : undefined}
      data-tone={tone === 'default' ? undefined : tone}
      {...props}
    >
      {children}
    </Component>
  );
}
