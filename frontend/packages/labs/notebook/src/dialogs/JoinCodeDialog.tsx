/**
 * JoinCodeDialog — MUI Dialog for joining a shared notebook via a short code.
 *
 * A teacher shares a 4–6 character alphanumeric code; the student enters it
 * here, the code is resolved to a URL via `resolveJoinCode`, then the
 * notebook is fetched via `importFromUrl`.  Input is normalised to uppercase
 * on every keystroke and the Join button stays disabled until the code
 * matches the valid-code pattern.
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
import {resolveJoinCode, JoinCodeError} from '../storage/joinCode';
import {importFromUrl, ImportError} from '../storage/importer';
import type {ImportResult} from '../storage/importer';

// ---------------------------------------------------------------------------
// String constants (Phase 12: replace with useString() calls)
// ---------------------------------------------------------------------------

/** Dialog title text. */
const STR_TITLE = 'Enter a join code';

/** Label for the join-code text field. */
const STR_FIELD_LABEL = 'Join code';

/** Label for the join submit button. */
const STR_JOIN = 'Join';

/** Label for the cancel button. */
const STR_CANCEL = 'Cancel';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Maximum number of characters allowed in the join code field. */
const JOIN_CODE_MAX_LENGTH = 6;

/**
 * Pattern a valid join code must match: 4–6 uppercase alphanumeric characters.
 * Tested against the uppercased, trimmed value before enabling the Join button.
 */
const JOIN_CODE_PATTERN = /^[A-Z0-9]{4,6}$/;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for JoinCodeDialog. */
export interface JoinCodeDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Session ID passed through to the importer. */
  sessionId: string;
  /** Called when the user dismisses the dialog without joining. */
  onClose: () => void;
  /** Called after a successful import with the resulting notebook. */
  onImported: (result: ImportResult) => void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalises raw text-field input to a valid join-code prefix: strips
 * non-alphanumeric characters, uppercases, and clamps to `JOIN_CODE_MAX_LENGTH`.
 *
 * @param raw Raw string from the change event value
 * @returns Sanitised uppercase code string
 */
function sanitiseCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, JOIN_CODE_MAX_LENGTH);
}

/**
 * Returns true when the given code string satisfies the valid-code pattern.
 *
 * @param code Sanitised uppercase code string
 * @returns Whether the code is ready to submit
 */
function isCodeValid(code: string): boolean {
  return JOIN_CODE_PATTERN.test(code);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog that lets the user enter a teacher-issued join code to import a
 * shared notebook.
 *
 * The code is resolved to a URL server-side; network and parse errors from
 * either step are shown in-place without closing the dialog.
 */
export function JoinCodeDialog({
  open,
  sessionId,
  onClose,
  onImported,
}: JoinCodeDialogProps): React.ReactElement {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** Whether the Join button should be active. */
  const isJoinDisabled = loading || !isCodeValid(code);

  /**
   * Resets local state when the dialog closes so the next open starts clean.
   */
  const handleClose = useCallback((): void => {
    if (loading) return;
    setCode('');
    setErrorMessage(null);
    onClose();
  }, [loading, onClose]);

  /**
   * Handles changes to the join-code field.
   * Sanitises input to uppercase alphanumeric and clears any previous error.
   * @param evt Change event from the TextField
   */
  const handleCodeChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>): void => {
      setCode(sanitiseCode(evt.target.value));
      setErrorMessage(null);
    },
    []
  );

  /**
   * Executes the join pipeline:
   *   1. Resolve the code to a URL via `resolveJoinCode`.
   *   2. Fetch and parse the notebook via `importFromUrl`.
   *   3. On success close the dialog and surface the result.
   *   4. On JoinCodeError or ImportError show the message without closing.
   */
  const handleJoin = useCallback(async (): Promise<void> => {
    if (!isCodeValid(code) || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const url = await resolveJoinCode(code);
      const result = await importFromUrl(url, sessionId, 'import-joincode');
      setCode('');
      onImported(result);
      onClose();
    } catch (err) {
      if (err instanceof JoinCodeError || err instanceof ImportError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [code, loading, sessionId, onImported, onClose]);

  /**
   * Submits the form when the user presses Enter in the code field.
   * @param evt Keyboard event from the TextField
   */
  const handleKeyDown = useCallback(
    (evt: React.KeyboardEvent<HTMLInputElement>): void => {
      if (evt.key === 'Enter' && !isJoinDisabled) {
        void handleJoin();
      }
    },
    [handleJoin, isJoinDisabled]
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{STR_TITLE}</DialogTitle>

      {loading && <LinearProgress />}

      <DialogContent>
        <TextField
          label={STR_FIELD_LABEL}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          error={errorMessage !== null}
          helperText={errorMessage ?? undefined}
          fullWidth
          autoFocus
          margin="dense"
          inputProps={{
            maxLength: JOIN_CODE_MAX_LENGTH,
            style: {textTransform: 'uppercase', letterSpacing: '0.2em'},
          }}
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
          onClick={() => void handleJoin()}
          disabled={isJoinDisabled}
        >
          {STR_JOIN}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
