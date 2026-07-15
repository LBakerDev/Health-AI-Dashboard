// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button, GlassSurface, SegmentedControl, TrendBadge } from '@shared/ui';

describe('shared UI primitives', () => {
  it('renders a glass surface with tone and interactivity attributes', () => {
    render(
      <GlassSurface interactive tone="insight">
        Insight surface
      </GlassSurface>,
    );

    const surface = screen.getByText('Insight surface').closest('.glass-surface');

    expect(surface?.getAttribute('data-tone')).toBe('insight');
    expect(surface?.getAttribute('data-interactive')).toBe('true');
  });

  it('renders a tactile button with the requested variant', () => {
    render(<Button variant="primary">Import data</Button>);

    expect(screen.getByRole('button', { name: /import data/i }).getAttribute('data-variant')).toBe(
      'primary',
    );
  });

  it('renders trend sentiment for signal badges', () => {
    render(
      <TrendBadge
        trend={{
          direction: 'down',
          label: '-2 bpm',
          sentiment: 'good',
        }}
      />,
    );

    expect(screen.getByText('-2 bpm').getAttribute('data-sentiment')).toBe('good');
  });

  it('calls back when a segmented control option is selected', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    render(
      <SegmentedControl
        ariaLabel="Week range"
        onValueChange={handleValueChange}
        options={[
          { label: 'This week', value: 'this-week' },
          { label: 'Last week', value: 'last-week' },
        ]}
        value="this-week"
      />,
    );

    await user.click(screen.getByRole('button', { name: /last week/i }));

    expect(handleValueChange).toHaveBeenCalledWith('last-week');
  });
});
