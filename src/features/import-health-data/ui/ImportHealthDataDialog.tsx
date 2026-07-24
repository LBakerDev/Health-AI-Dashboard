import { useId, useRef, useState } from 'react';

import { Button } from '@shared/ui/button';
import { GlassSurface } from '@shared/ui/glass-surface';
import { FileArchive, Lock, X } from '@shared/ui/icons';

interface ImportHealthDataDialogProps {
  errorMessage?: string | null;
  lastImportLabel?: string | null;
  onClose: () => void;
  onResetSample?: () => void;
  onStartImport: (file: File) => void;
  open: boolean;
  showResetSample?: boolean;
}

export function ImportHealthDataDialog({
  errorMessage,
  lastImportLabel,
  onClose,
  onResetSample,
  onStartImport,
  open,
  showResetSample = false,
}: ImportHealthDataDialogProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!open) {
    return null;
  }

  const importFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    onStartImport(file);
  };

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
          Choose export.xml from your Apple Health export and the dashboard will parse it locally on
          this device.
        </p>
        {lastImportLabel ? <p className="import-dialog__meta">{lastImportLabel}</p> : null}
        <label
          className="dropzone"
          data-dragging={dragActive || undefined}
          htmlFor={inputId}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            importFile(event.dataTransfer.files[0]);
          }}
        >
          <FileArchive size={24} strokeWidth={2} />
          <span>Drop export.xml</span>
          <small>Tap to choose from Files · ZIP support next</small>
        </label>
        <input
          accept=".zip,.xml,application/zip,application/xml,text/xml"
          aria-label="Choose Apple Health export file"
          className="visually-hidden"
          id={inputId}
          onChange={(event) => importFile(event.target.files?.[0])}
          ref={fileInputRef}
          type="file"
        />
        {errorMessage ? (
          <p className="import-dialog__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="import-dialog__actions">
          <Button onClick={() => fileInputRef.current?.click()} variant="primary">
            Choose export file
          </Button>
          {showResetSample ? (
            <Button onClick={onResetSample} variant="secondary">
              Use sample data
            </Button>
          ) : null}
        </div>
        <p className="privacy-note">
          <Lock size={14} strokeWidth={2.2} />
          Parsed on this device, never uploaded.
        </p>
      </GlassSurface>
    </div>
  );
}
