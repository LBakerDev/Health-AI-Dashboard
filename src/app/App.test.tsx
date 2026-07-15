// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the weekly summary dashboard by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /this week at a glance/i })).toBeTruthy();
    expect(screen.getByText(/conditioning is improving - on track/i)).toBeTruthy();
  });
});
