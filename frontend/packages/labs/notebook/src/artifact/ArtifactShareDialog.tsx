/**
 * ArtifactShareDialog — MUI Dialog for sharing a notebook as a completion artifact.
 *
 * On open: builds the artifact payload, encodes it, emits telemetry (no PII),
 * and renders the ArtifactQR component along with a print button.
 */

import {useState, useEffect} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import type {Notebook} from '../storage/NotebookLabDB';
import {buildArtifactPayload} from './artifactPayload';
import {encodeArtifact} from './codec';
import {ArtifactQR} from './ArtifactQR';
import {trackEvent} from '../telemetry/wrapper';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for ArtifactShareDialog. */
export interface ArtifactShareDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Notebook document to build the artifact from. */
  notebook: Notebook;
  /** Stable notebook identifier. */
  notebookId: string;
  /** Learner-chosen session label; included in artifact but not telemetry. */
  sessionLabel: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog that builds a completion artifact from the current notebook and
 * presents a QR code plus a print button for sharing with a teacher.
 *
 * Telemetry: emits nblab.artifact.shared on open with only non-PII fields.
 */
export function ArtifactShareDialog({
  open,
  onClose,
  notebook,
  notebookId,
  sessionLabel,
}: ArtifactShareDialogProps): React.ReactElement {
  const [encoded, setEncoded] = useState<string | null>(null);

  // Build and encode the artifact when the dialog opens.
  // Reset encoded state when dialog closes so it regenerates on next open.
  useEffect(() => {
    if (!open) {
      setEncoded(null);
      return;
    }

    const artifact = buildArtifactPayload(notebook, notebookId, sessionLabel);
    const enc = encodeArtifact(artifact);
    setEncoded(enc);

    // T146: telemetry — no PII; only structural metadata.
    trackEvent('nblab.artifact.shared', {cellCount: notebook.cells.length});
  }, [open, notebook, notebookId, sessionLabel]);

  /**
   * Handles the "Print / Save to PDF" button by triggering the browser print
   * dialog.  The print.css stylesheet hides nav elements in the printed output.
   */
  function handlePrint(): void {
    window.print();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share with Teacher</DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2}}>
        {encoded !== null && <ArtifactQR encoded={encoded} />}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handlePrint} className="no-print">
          Print / Save to PDF
        </Button>
        <Button onClick={onClose} className="no-print">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
