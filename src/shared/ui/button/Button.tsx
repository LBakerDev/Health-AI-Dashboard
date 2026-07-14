import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@shared/lib';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  size = 'md',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn('tactile-button', className)}
      data-size={size === 'md' ? undefined : size}
      data-variant={variant}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
