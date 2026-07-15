import { GlassSurface } from '@shared/ui/glass-surface';
import { CheckCircle2, LoaderCircle } from '@shared/ui/icons';

interface ParsingOverlayProps {
  label: string;
  open: boolean;
  progress: number;
}

export function ParsingOverlay({ label, open, progress }: ParsingOverlayProps) {
  if (!open) {
    return null;
  }

  const complete = progress >= 100;

  return (
    <div className="modal-backdrop" role="presentation">
      <GlassSurface
        aria-labelledby="parsing-title"
        aria-modal="true"
        className="import-dialog import-dialog--loading"
        role="dialog"
        tone="solid"
      >
        <div className="loading-mark" data-complete={complete || undefined} aria-hidden="true">
          {complete ? (
            <CheckCircle2 size={30} strokeWidth={2.1} />
          ) : (
            <LoaderCircle size={30} strokeWidth={2.1} />
          )}
        </div>
        <p className="eyebrow">Building dashboard</p>
        <h2 id="parsing-title">Parsing your export</h2>
        <p>{label}</p>
        <div
          className="progress-track"
          aria-label="Import progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          role="progressbar"
        >
          <i style={{ width: `${progress}%` }} />
        </div>
      </GlassSurface>
    </div>
  );
}
