/**
 * UrlImportDialog — MUI Dialog for importing a notebook from a URL.
 *
 * Accepts a raw .ipynb URL or a GitHub file URL (which is rewritten to the
 * raw content URL before fetching).  Delegates all network and parse work to
 * `importFromUrl`; the dialog stays open on error so the user can correct the
 * URL without losing their input.
 *
 * Strings are hard-coded in English for Phase 7.  The shape mirrors what
 * `useString()` would return so Phase 12 can drop the i18n hook in without
 * structural changes.
 */

import {useState, useCallback} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import {rewriteGithubUrl} from '../storage/githubUrl';
import {importFromUrl, ImportError} from '../storage/importer';
import type {ImportResult} from '../storage/importer';

// ---------------------------------------------------------------------------
// String constants (Phase 12: replace with useString() calls)
// ---------------------------------------------------------------------------

/** Dialog title text. */
const STR_TITLE = 'Import from URL';

/** Label for the URL text field. */
const STR_FIELD_LABEL = 'Notebook URL';

/** Helper text shown below the URL field when there is no error. */
const STR_FIELD_HELPER = 'GitHub URLs are supported';

/** Label for the import submit button. */
const STR_IMPORT = 'Import';

/** Label for the cancel button. */
const STR_CANCEL = 'Cancel';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for UrlImportDialog. */
export interface UrlImportDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Session ID passed through to the importer. */
  sessionId: string;
  /** Called when the user dismisses the dialog without importing. */
  onClose: () => void;
  /** Called after a successful import with the resulting notebook. */
  onImported: (result: ImportResult) => void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Determines the ImportSource value to use given whether URL rewriting
 * changed the original input.
 *
 * @param original The URL string as typed by the user
 * @param rewritten The URL after `rewriteGithubUrl` processing
 * @returns `'import-github'` when rewriting changed the URL, else `'import-url'`
 */
function resolveImportSource(
  original: string,
  rewritten: string
): 'import-github' | 'import-url' {
  return rewritten !== original ? 'import-github' : 'import-url';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog that lets the user paste a notebook URL and trigger an import.
 *
 * GitHub URLs are transparently rewritten to raw content URLs.  An error
 * message is shown in-place if the import fails; success closes the dialog
 * and calls `onImported`.
 */
export function UrlImportDialog({
  open,
  sessionId,
  onClose,
  onImported,
}: UrlImportDialogProps): React.ReactElement {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** Whether the Import button should be active. */
  const isImportDisabled = loading || url.trim().length === 0;

  /**
   * Resets local state when the dialog closes so the next open starts fresh.
   */
  const handleClose = useCallback((): void => {
    if (loading) return;
    setUrl('');
    setErrorMessage(null);
    onClose();
  }, [loading, onClose]);

  /**
   * Handles changes to the URL input field.
   * @param evt Change event from the TextField
   */
  const handleUrlChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>): void => {
      setUrl(evt.target.value);
      setErrorMessage(null);
    },
    []
  );

  /**
   * Executes the import pipeline:
   *   1. Rewrite the URL if it looks like a GitHub file URL.
   *   2. Call `importFromUrl` with the appropriate source tag.
   *   3. On success close the dialog and surface the result.
   *   4. On ImportError show the error message without closing.
   */
  const handleImport = useCallback(async (): Promise<void> => {
    const trimmed = url.trim();
    if (trimmed.length === 0 || loading) return;

    const rewritten = rewriteGithubUrl(trimmed);
    const source = resolveImportSource(trimmed, rewritten);

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await importFromUrl(rewritten, sessionId, source);
      setUrl('');
      onImported(result);
      onClose();
    } catch (err) {
      if (err instanceof ImportError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [url, loading, sessionId, onImported, onClose]);

  /**
   * Submits the form when the user presses Enter in the URL field.
   * @param evt Keyboard event from the TextField
   */
  const handleKeyDown = useCallback(
    (evt: React.KeyboardEvent<HTMLInputElement>): void => {
      if (evt.key === 'Enter' && !isImportDisabled) {
        void handleImport();
      }
    },
    [handleImport, isImportDisabled]
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{STR_TITLE}</DialogTitle>

      {loading && <LinearProgress />}

      <DialogContent>
        <TextField
          label={STR_FIELD_LABEL}
          helperText={errorMessage ?? STR_FIELD_HELPER}
          error={errorMessage !== null}
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          fullWidth
          autoFocus
          margin="dense"
        />

        {errorMessage !== null && (
          <Typography variant="body2" color="error" sx={{mt: 1}}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {STR_CANCEL}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleImport()}
          disabled={isImportDisabled}
        >
          {STR_IMPORT}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
