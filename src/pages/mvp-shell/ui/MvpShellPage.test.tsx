// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppProviders } from '@app/providers';

import { MvpShellPage } from './MvpShellPage';

const appleHealthXml = `<?xml version="1.0" encoding="UTF-8"?>
<HealthData locale="en_US">
  <Record type="HKQuantityTypeIdentifierStepCount" sourceName="London's Apple Watch" unit="count" creationDate="2026-06-20 12:00:00 -0400" startDate="2026-06-20 09:00:00 -0400" endDate="2026-06-20 09:30:00 -0400" value="7000" />
  <Record type="HKQuantityTypeIdentifierActiveEnergyBurned" sourceName="London's Apple Watch" unit="Cal" creationDate="2026-06-20 12:00:00 -0400" startDate="2026-06-20 09:00:00 -0400" endDate="2026-06-20 09:30:00 -0400" value="300" />
  <Workout workoutActivityType="HKWorkoutActivityTypeBasketball" duration="40" durationUnit="min" totalEnergyBurned="240" totalEnergyBurnedUnit="Cal" sourceName="London's Apple Watch" startDate="2026-06-20 09:00:00 -0400" endDate="2026-06-20 09:40:00 -0400" />
</HealthData>`;

function renderPage() {
  render(
    <AppProviders>
      <MvpShellPage />
    </AppProviders>,
  );
}

describe('MvpShellPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it('imports an Apple Health XML file and persists the dashboard payload', async () => {
    const user = userEvent.setup();
    const file = new File([appleHealthXml], 'export.xml', { type: 'application/xml' });
    renderPage();

    await user.click(screen.getByRole('button', { name: /import health data/i }));
    await user.upload(screen.getByLabelText(/choose apple health export file/i), file);

    expect(await screen.findByText(/data parsed locally from export.xml/i)).toBeTruthy();
    expect(window.localStorage.getItem('health-ai-dashboard:mvp1-payload')).toContain('export.xml');
  });
});
