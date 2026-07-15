import { useEffect, useState } from 'react';

import { APP_NAME } from '@shared/config';
import { mvp1DashboardPayload } from '@data/mock';
import { CardioFitnessView } from '@features/cardio-fitness';
import { ImportHealthDataDialog, ParsingOverlay } from '@features/import-health-data';
import { WeeklySummaryView } from '@features/weekly-summary';
import { GlassSurface } from '@shared/ui/glass-surface';
import { Activity } from '@shared/ui/icons';
import { SegmentedControl } from '@shared/ui/segmented-control';

type DashboardView = 'weekly' | 'cardio';
type ImportFlowState = 'closed' | 'dialog' | 'parsing';
type WeekRange = 'this-week' | 'last-week';

const importStages = [
  { label: 'Reading Apple Health records...', progress: 14 },
  { label: 'De-duplicating overlapping Watch, iPhone, and Peloton sources...', progress: 42 },
  { label: 'Aggregating daily and weekly rollups...', progress: 68 },
  { label: 'Preparing the weekly insight...', progress: 91 },
  { label: 'Dashboard ready.', progress: 100 },
];

function getInitialDashboardView(): DashboardView {
  if (typeof window === 'undefined') {
    return 'weekly';
  }

  const view = new URLSearchParams(window.location.search).get('view');

  return view === 'cardio' ? 'cardio' : 'weekly';
}

export function MvpShellPage() {
  const [activeView, setActiveView] = useState<DashboardView>(getInitialDashboardView);
  const [importFlow, setImportFlow] = useState<ImportFlowState>('closed');
  const [importStageIndex, setImportStageIndex] = useState(0);
  const [weekRange, setWeekRange] = useState<WeekRange>('this-week');

  const importStage = importStages[importStageIndex];

  useEffect(() => {
    if (importFlow !== 'parsing') {
      return undefined;
    }

    if (importStageIndex >= importStages.length - 1) {
      const doneTimer = window.setTimeout(() => {
        setImportFlow('closed');
        setImportStageIndex(0);
      }, 650);

      return () => window.clearTimeout(doneTimer);
    }

    const timer = window.setTimeout(() => {
      setImportStageIndex((stageIndex) => stageIndex + 1);
    }, 720);

    return () => window.clearTimeout(timer);
  }, [importFlow, importStageIndex]);

  const startImport = () => {
    setImportStageIndex(0);
    setImportFlow('parsing');
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
              <span>{mvp1DashboardPayload.weeklySummary.week.label}</span>
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
              onClick={() => setImportFlow('dialog')}
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
              payload={mvp1DashboardPayload}
            />
          ) : (
            <CardioFitnessView
              onBack={() => setActiveView('weekly')}
              payload={mvp1DashboardPayload}
            />
          )}
        </div>
      </div>

      <ImportHealthDataDialog
        onClose={() => setImportFlow('closed')}
        onStartImport={startImport}
        open={importFlow === 'dialog'}
      />
      <ParsingOverlay
        label={importStage.label}
        open={importFlow === 'parsing'}
        progress={importStage.progress}
      />
    </>
  );
}
