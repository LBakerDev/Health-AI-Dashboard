import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the weekly summary dashboard by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /this week at a glance/i })).toBeInTheDocument();
    expect(screen.getByText(/fat-loss progress is on track/i)).toBeInTheDocument();
  });
});
