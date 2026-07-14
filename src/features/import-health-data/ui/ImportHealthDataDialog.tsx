import { FileArchive, Lock, X } from 'lucide-react';

import { Button, GlassSurface } from '@shared/ui';

interface ImportHealthDataDialogProps {
  onClose: () => void;
  onStartImport: () => void;
  open: boolean;
}

export function ImportHealthDataDialog({
  onClose,
  onStartImport,
  open,
}: ImportHealthDataDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <GlassSurface
        aria-labelledby="import-title"
        aria-modal="true"
        className="import-dialog"
        role="dialog"
        tone="solid"
      >
        <Button
          aria-label="Close import dialog"
          className="import-dialog__close"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X size={18} strokeWidth={2.2} />
        </Button>
        <div className="import-dialog__icon" aria-hidden="true">
          <FileArchive size={28} strokeWidth={2} />
        </div>
        <p className="eyebrow">Local import</p>
        <h2 id="import-title">Import Apple Health data</h2>
        <p>
          Drop an Apple Health export when the parser is wired. This prototype keeps the action
          local and shows the expected loading path.
        </p>
        <button className="dropzone" onClick={onStartImport} type="button">
          <FileArchive size={24} strokeWidth={2} />
          <span>Drop export.zip or export.xml</span>
          <small>Click to simulate parsing sample data</small>
        </button>
        <Button onClick={onStartImport} variant="primary">
          Parse my data
        </Button>
        <p className="privacy-note">
          <Lock size={14} strokeWidth={2.2} />
          Parsed on this device, never uploaded.
        </p>
      </GlassSurface>
    </div>
  );
}
