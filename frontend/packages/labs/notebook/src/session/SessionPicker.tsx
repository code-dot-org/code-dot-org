/**
 * SessionPicker — UI shown when no session is active on a shared device.
 *
 * Two entry paths:
 *   1. Free-text label — learner types a name/nickname and presses "Start".
 *   2. 4-char code — learner types a short alphanumeric code to rejoin an
 *      existing session without scrolling the list.
 *
 * Existing sessions from the catalog are shown in a list; tapping one
 * activates it immediately.
 *
 * Label text is treated as PII.  This component never passes labels to any
 * telemetry function; the caller is responsible for any telemetry that
 * needs to fire after session creation.
 *
 * Strings are hard-coded in English for Phase 6.  The shape mirrors what
 * `useString()` would return so Phase 12 can drop the i18n hook in without
 * structural changes.
 */

import {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  type Session,
  listSessions,
  createSession,
  activateSession,
} from '../storage/sessionRepo';

// ---------------------------------------------------------------------------
// String constants (Phase 12: replace with useString() calls)
// ---------------------------------------------------------------------------

/** UI label for the name/nickname input. */
const STR_LABEL_INPUT = 'Your name or nickname';

/** Placeholder shown inside the label TextField. */
const STR_LABEL_PLACEHOLDER = 'e.g. Alex';

/** UI label for the 4-char code input. */
const STR_CODE_INPUT = 'Or enter a 4-char code';

/** Placeholder shown inside the code TextField. */
const STR_CODE_PLACEHOLDER = 'e.g. AB3X';

/** Submit button text for a new label. */
const STR_START = 'Start';

/** Submit button text when entering a 4-char code. */
const STR_CONTINUE_CODE = 'Continue';

/** Section heading for the existing-sessions list. */
const STR_EXISTING_HEADING = 'Continue as…';

/** Accessible label for the existing-session list. */
const STR_EXISTING_LIST_LABEL = 'Existing sessions';

/** Error shown when the code does not match any session. */
const STR_CODE_NOT_FOUND = 'Code not found. Check the code and try again.';

/** Max length of the 4-char code input. */
const CODE_MAX_LENGTH = 4;

/** Characters considered valid in a session code (uppercase alphanumeric). */
const CODE_PATTERN = /^[A-Z0-9]*$/;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for SessionPicker. */
export interface SessionPickerProps {
  /** Called after a session is activated and ready. */
  onSessionReady: (session: Session) => void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Filters sessions to only those whose id starts with the given code prefix,
 * treating the code as the first CODE_MAX_LENGTH characters (uppercased) of
 * the session id.
 *
 * The "code" is the first 4 uppercase alphanumeric chars of the UUID stripped
 * of hyphens — deterministic and reversible without storing a separate field.
 *
 * @param sessions Full session list
 * @param code Uppercase alphanumeric code entered by the learner
 * @returns Matching sessions
 */
function findByCode(sessions: Session[], code: string): Session[] {
  if (code.length === 0) return [];
  const needle = code.toUpperCase();
  return sessions.filter(s => {
    const stripped = s.id.replace(/-/g, '').toUpperCase();
    return stripped.startsWith(needle);
  });
}

/**
 * Sanitises a raw code-field keystroke: strips non-alphanumeric chars,
 * uppercases, and clamps to CODE_MAX_LENGTH.
 *
 * @param raw Raw string from the input event
 * @returns Sanitised code string
 */
function sanitiseCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_MAX_LENGTH);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Props for ExistingSessionList. */
interface ExistingSessionListProps {
  /** Sessions to display. */
  sessions: Session[];
  /** Called when a session entry is selected. */
  onSelect: (session: Session) => void;
}

/**
 * Renders a labelled list of existing sessions.
 * Each entry is a tappable button that immediately activates the session.
 */
function ExistingSessionList({
  sessions,
  onSelect,
}: ExistingSessionListProps): React.ReactElement {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {STR_EXISTING_HEADING}
      </Typography>
      <List aria-label={STR_EXISTING_LIST_LABEL} disablePadding>
        {sessions.map(session => (
          <ListItem key={session.id} disablePadding>
            <ListItemButton onClick={() => onSelect(session)}>
              <Typography variant="body2">{session.label}</Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Session picker screen shown when no session is active.
 *
 * Manages its own async state for loading the session catalog.
 * Calls `onSessionReady` once a session has been activated.
 */
export function SessionPicker({
  onSessionReady,
}: SessionPickerProps): React.ReactElement {
  const [existingSessions, setExistingSessions] = useState<Session[]>([]);
  const [labelValue, setLabelValue] = useState('');
  const [codeValue, setCodeValue] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Load existing sessions from the catalog on mount.
  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      const sessions = await listSessions();
      if (!cancelled) setExistingSessions(sessions);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Handles changes to the code input field.
   * Strips non-alphanumeric chars, uppercases, and clamps length.
   * @param evt Change event from the TextField
   */
  function handleCodeChange(evt: React.ChangeEvent<HTMLInputElement>): void {
    const sanitised = sanitiseCode(evt.target.value);
    setCodeValue(sanitised);
    setCodeError(null);
  }

  /**
   * Creates a new session from the label field and invokes onSessionReady.
   */
  async function handleStartByLabel(): Promise<void> {
    const trimmed = labelValue.trim();
    if (trimmed.length === 0 || busy) return;
    setBusy(true);
    try {
      const session = await createSession(trimmed);
      await activateSession(session.id);
      onSessionReady(session);
    } finally {
      setBusy(false);
    }
  }

  /**
   * Looks up the entered code in the session catalog and activates if found.
   * Sets a localised error if the code does not match.
   */
  async function handleContinueByCode(): Promise<void> {
    if (codeValue.length === 0 || busy) return;
    if (!CODE_PATTERN.test(codeValue)) return;
    setBusy(true);
    try {
      const matches = findByCode(existingSessions, codeValue);
      if (matches.length === 0) {
        setCodeError(STR_CODE_NOT_FOUND);
        return;
      }
      const session = matches[0];
      await activateSession(session.id);
      onSessionReady(session);
    } finally {
      setBusy(false);
    }
  }

  /**
   * Activates an existing session selected directly from the list.
   * @param session Session the learner tapped
   */
  async function handleSelectExisting(session: Session): Promise<void> {
    if (busy) return;
    setBusy(true);
    try {
      await activateSession(session.id);
      onSessionReady(session);
    } finally {
      setBusy(false);
    }
  }

  /**
   * Submits the label form on Enter key in the label field.
   * @param evt Keyboard event
   */
  function handleLabelKeyDown(evt: React.KeyboardEvent<HTMLInputElement>): void {
    if (evt.key === 'Enter') void handleStartByLabel();
  }

  /**
   * Submits the code form on Enter key in the code field.
   * @param evt Keyboard event
   */
  function handleCodeKeyDown(evt: React.KeyboardEvent<HTMLInputElement>): void {
    if (evt.key === 'Enter') void handleContinueByCode();
  }

  const labelTrimmed = labelValue.trim();
  const canStart = labelTrimmed.length > 0 && !busy;
  const canContinueCode =
    codeValue.length === CODE_MAX_LENGTH && CODE_PATTERN.test(codeValue) && !busy;

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* New session via free-text label */}
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
        <TextField
          label={STR_LABEL_INPUT}
          placeholder={STR_LABEL_PLACEHOLDER}
          value={labelValue}
          onChange={evt => setLabelValue(evt.target.value)}
          onKeyDown={handleLabelKeyDown}
          disabled={busy}
          fullWidth
          inputProps={{'aria-label': STR_LABEL_INPUT}}
        />
        <Button
          variant="contained"
          disabled={!canStart}
          onClick={() => void handleStartByLabel()}
        >
          {STR_START}
        </Button>
      </Box>

      {/* Rejoin via 4-char code */}
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
        <TextField
          label={STR_CODE_INPUT}
          placeholder={STR_CODE_PLACEHOLDER}
          value={codeValue}
          onChange={handleCodeChange}
          onKeyDown={handleCodeKeyDown}
          disabled={busy}
          error={codeError !== null}
          helperText={codeError ?? undefined}
          fullWidth
          inputProps={{
            maxLength: CODE_MAX_LENGTH,
            'aria-label': STR_CODE_INPUT,
          }}
        />
        <Button
          variant="outlined"
          disabled={!canContinueCode}
          onClick={() => void handleContinueByCode()}
        >
          {STR_CONTINUE_CODE}
        </Button>
      </Box>

      {/* Existing sessions list (only rendered when catalog is non-empty) */}
      {existingSessions.length > 0 && (
        <>
          <Divider />
          <ExistingSessionList
            sessions={existingSessions}
            onSelect={session => void handleSelectExisting(session)}
          />
        </>
      )}
    </Box>
  );
}
