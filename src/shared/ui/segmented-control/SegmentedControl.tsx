import type { ReactNode } from 'react';

export interface SegmentedControlOption<TValue extends string> {
  label: ReactNode;
  value: TValue;
}

interface SegmentedControlProps<TValue extends string> {
  ariaLabel: string;
  onValueChange: (value: TValue) => void;
  options: SegmentedControlOption<TValue>[];
  value: TValue;
}

export function SegmentedControl<TValue extends string>({
  ariaLabel,
  onValueChange,
  options,
  value,
}: SegmentedControlProps<TValue>) {
  return (
    <div aria-label={ariaLabel} className="segmented-control" role="group">
      {options.map((option) => (
        <button
          aria-pressed={option.value === value}
          className="segmented-control__option"
          key={option.value}
          onClick={() => onValueChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
