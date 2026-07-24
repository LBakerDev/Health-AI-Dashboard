import { useState } from 'react';

import type { Mvp1DashboardPayload } from '@entities/health-metric';
import { APP_NAME } from '@shared/config';
import { mvp1DashboardPayload } from '@data/mock';
import { CardioFitnessView } from '@features/cardio-fitness';
import {
  clearStoredDashboardPayload,
  importHealthDataFile,
  ImportHealthDataDialog,
  ParsingOverlay,
  readStoredDashboardPayload,
  writeStoredDashboardPayload,
} from '@features/import-health-data';
import type { ImportProgress } from '@features/import-health-data';
import { WeeklySummaryView } from '@features/weekly-summary';
import { GlassSurface } from '@shared/ui/glass-surface';
import { Activity } from '@shared/ui/icons';
import { SegmentedControl } from '@shared/ui/segmented-control';

type DashboardView = 'weekly' | 'cardio';
type ImportFlowState = 'closed' | 'dialog' | 'parsing';
type WeekRange = 'this-week' | 'last-week';

const initialImportProgress = { label: 'Waiting for Apple Health export...', progress: 0 };

function getInitialDashboardView(): DashboardView {
  if (typeof window === 'undefined') {
    return 'weekly';
  }

  const view = new URLSearchParams(window.location.search).get('view');

  return view === 'cardio' ? 'cardio' : 'weekly';
}

export function MvpShellPage() {
  const [activeView, setActiveView] = useState<DashboardView>(getInitialDashboardView);
  const [dashboardPayload, setDashboardPayload] = useState(
    () => readStoredDashboardPayload() ?? mvp1DashboardPayload,
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [importFlow, setImportFlow] = useState<ImportFlowState>('closed');
  const [importProgress, setImportProgress] = useState<ImportProgress>(initialImportProgress);
  const [weekRange, setWeekRange] = useState<WeekRange>('this-week');

  const startImport = async (file: File) => {
    setImportError(null);
    setImportProgress(initialImportProgress);
    setImportFlow('parsing');

    try {
      const { payload } = await importHealthDataFile(file, setImportProgress);

      setDashboardPayload(payload);
      writeStoredDashboardPayload(payload);

      window.setTimeout(() => {
        setImportFlow('closed');
      }, 700);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unable to parse this export.');
      setImportFlow('dialog');
    }
  };

  const openImportDialog = () => {
    setImportError(null);
    setImportFlow('dialog');
  };

  const resetToSampleData = () => {
    clearStoredDashboardPayload();
    setDashboardPayload(mvp1DashboardPayload);
    setImportError(null);
    setImportFlow('closed');
  };

  return (
    <>
      <div className="dashboard-shell">
        <GlassSurface as="header" className="dashboard-topbar" tone="solid">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <Activity size={19} strokeWidth={2.2} />
            </span>
            <div>
              <strong>{APP_NAME}</strong>
              <span>{dashboardPayload.weeklySummary.week.label}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <SegmentedControl
              ariaLabel="Week comparison"
              onValueChange={setWeekRange}
              options={[
                { label: 'This week', value: 'this-week' },
                { label: 'Last week', value: 'last-week' },
              ]}
              value={weekRange}
            />
            <button
              aria-label="Import health data"
              className="profile-button"
              onClick={openImportDialog}
              type="button"
            >
              L
            </button>
          </div>
        </GlassSurface>

        <nav aria-label="Dashboard views" className="dashboard-tabs">
          <button
            aria-current={activeView === 'weekly' ? 'page' : undefined}
            onClick={() => setActiveView('weekly')}
            type="button"
          >
            Weekly Summary
          </button>
          <button
            aria-current={activeView === 'cardio' ? 'page' : undefined}
            onClick={() => setActiveView('cardio')}
            type="button"
          >
            Cardio Fitness
          </button>
        </nav>

        <div className="dashboard-content">
          {activeView === 'weekly' ? (
            <WeeklySummaryView
              onOpenCardio={() => setActiveView('cardio')}
              payload={dashboardPayload}
            />
          ) : (
            <CardioFitnessView onBack={() => setActiveView('weekly')} payload={dashboardPayload} />
          )}
        </div>
      </div>

      <ImportHealthDataDialog
        errorMessage={importError}
        lastImportLabel={getLastImportLabel(dashboardPayload)}
        onClose={() => setImportFlow('closed')}
        onResetSample={resetToSampleData}
        onStartImport={startImport}
        open={importFlow === 'dialog'}
        showResetSample={dashboardPayload.importSummary.status !== 'sample'}
      />
      <ParsingOverlay
        label={importProgress.label}
        open={importFlow === 'parsing'}
        progress={importProgress.progress}
      />
    </>
  );
}

function getLastImportLabel(payload: Mvp1DashboardPayload) {
  if (payload.importSummary.status === 'sample' || !payload.importSummary.importedAt) {
    return 'Sample mode is active';
  }

  return `Last import: ${payload.importSummary.sourceLabel}`;
}
