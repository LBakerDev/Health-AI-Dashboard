import { Activity } from 'lucide-react';

import { APP_NAME } from '@shared/config';

export function MvpShellPage() {
  return (
    <main className="app-shell" aria-labelledby="app-title">
      <section className="starter-panel">
        <div className="starter-icon" aria-hidden="true">
          <Activity size={28} strokeWidth={2} />
        </div>
        <p className="eyebrow">MVP 1 scaffold</p>
        <h1 id="app-title">{APP_NAME}</h1>
        <p>
          Foundation is ready for the Weekly Summary, Cardio Fitness detail, typed health data, and
          local-first import flow.
        </p>
      </section>
    </main>
  );
}
