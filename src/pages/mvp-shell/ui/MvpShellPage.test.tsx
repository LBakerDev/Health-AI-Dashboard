// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@app/providers';

import { MvpShellPage } from './MvpShellPage';

function renderPage() {
  render(
    <AppProviders>
      <MvpShellPage />
    </AppProviders>,
  );
}

describe('MvpShellPage', () => {
  it('switches from weekly summary to cardio detail', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /open detail/i }));

    expect(screen.getByRole('heading', { name: /are workouts getting better/i })).toBeTruthy();
  });

  it('opens the import dialog from the topbar profile action', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /import health data/i }));

    expect(screen.getByRole('dialog', { name: /import apple health data/i })).toBeTruthy();
  });
});
