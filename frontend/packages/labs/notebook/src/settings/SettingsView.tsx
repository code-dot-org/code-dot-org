/**
 * SettingsView — session lifecycle and personalisation settings page.
 *
 * Exposes four controls:
 *
 *   Language picker — switches the active UI locale via LocalePicker.
 *   Theme toggle   — switches between light/dark themes via ThemePicker.
 *   Sign out       — clears the active session pointer in the catalog.
 *   Delete session — purges all notebooks then removes the session record.
 *
 * Locale and theme selections are persisted via prefsStore keyed by sessionId:
 *   nblab.locale.<sessionId>
 *   nblab.theme.<sessionId>
 *
 * Both destructive actions are disabled while a storage operation is in flight.
 */

import {useState} from 'react';
import {Box, Button, Divider, Typography} from '@mui/material';
import {signOut, deleteSession as deleteSessionFromCatalog} from '../storage/sessionRepo';
import {deleteSession as deleteNotebooks} from '../storage/notebookRepo';
import {useSession, useSessionDispatch} from '../session/sessionStore';
import * as prefsStore from '../storage/prefsStore';
import type {SupportedLocale} from '../i18n/localeMeta';
import type {LabTheme} from '../theme/index';
import {LocalePicker} from './LocalePicker';
import {ThemePicker} from './ThemePicker';
import {AccessibilityPanel} from './AccessibilityPanel';

// ---------------------------------------------------------------------------
// String constants
// ---------------------------------------------------------------------------

/** Page heading. */
const STR_HEADING = 'Settings';

/** Language section heading. */
const STR_LANGUAGE_HEADING = 'Language';

/** Theme section heading. */
const STR_THEME_HEADING = 'Theme';

/** Accessibility section heading. */
const STR_ACCESSIBILITY_HEADING = 'Accessibility';

/** Session section heading. */
const STR_SESSION_HEADING = 'Session';

/** Sign out button label. */
const STR_SIGN_OUT = 'Sign out of this session';

/** Delete session button label. */
const STR_DELETE = 'Delete this session';

/**
 * Confirmation prompt shown before deleting a session.
 * window.confirm is used intentionally — a native dialog avoids focus-trap
 * issues inside a PWA and is appropriate for a destructive low-frequency action.
 */
const STR_DELETE_CONFIRM =
  'Delete this session and all its notebooks? This cannot be undone.';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for {@link SettingsView}.
 */
export interface SettingsViewProps {
  /** Currently active locale; drives the LocalePicker's displayed value. */
  locale: SupportedLocale;
  /** Currently active theme; drives the ThemePicker's displayed value. */
  theme: LabTheme;
  /**
   * Called when the user picks a different locale.
   * The parent (lab-root) owns locale state and must update it.
   * @param l New locale tag
   */
  onLocaleChange: (l: SupportedLocale) => void;
  /**
   * Called when the user toggles the theme.
   * The parent owns theme state and must update it.
   * @param t New theme value
   */
  onThemeChange: (t: LabTheme) => void;
  /**
   * Called when the OpenDyslexic font toggle changes.
   * The parent (LabInner) applies data-font on the root element.
   * @param enabled New toggle value
   */
  onFontChange?: (enabled: boolean) => void;
  /**
   * Called when the increased line spacing toggle changes.
   * The parent applies data-line-spacing on the root element.
   * @param enabled New toggle value
   */
  onLineSpacingChange?: (enabled: boolean) => void;
  /**
   * Called when the focus mode toggle changes.
   * The parent applies data-focus-mode on the root element.
   * @param enabled New toggle value
   */
  onFocusModeChange?: (enabled: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Settings page providing personalisation controls and session-lifecycle actions.
 *
 * Reads the active session from SessionContext and dispatches CLEAR_SESSION
 * after each destructive operation so the upstream SessionGate re-renders the
 * picker immediately.
 *
 * Locale and theme changes are persisted to prefsStore and bubbled up through
 * the onLocaleChange / onThemeChange callbacks so lab-root can keep its own
 * state in sync.
 */
export function SettingsView({
  locale,
  theme,
  onLocaleChange,
  onThemeChange,
  onFontChange,
  onLineSpacingChange,
  onFocusModeChange,
}: SettingsViewProps): React.ReactElement {
  const {activeSession} = useSession();
  const dispatch = useSessionDispatch();
  const [busy, setBusy] = useState(false);

  // ---------------------------------------------------------------------------
  // Accessibility toggle state (no persistence in Phase 16 polish)
  // ---------------------------------------------------------------------------

  /** Whether the read-aloud feature is currently enabled. */
  const [readAloud, setReadAloud] = useState(false);
  /** Whether the OpenDyslexic font is currently active. */
  const [openDyslexicFont, setOpenDyslexicFont] = useState(false);
  /** Whether increased line spacing is active. */
  const [increasedLineSpacing, setIncreasedLineSpacing] = useState(false);
  /** Whether focus mode is active. */
  const [focusMode, setFocusMode] = useState(false);

  const disabled = activeSession === null || busy;

  /**
   * Handles OpenDyslexic font toggle; bubbles up to LabInner when a callback
   * is provided.
   * @param enabled New toggle value
   */
  function handleFontChange(enabled: boolean): void {
    setOpenDyslexicFont(enabled);
    onFontChange?.(enabled);
  }

  /**
   * Handles line spacing toggle; bubbles up to LabInner when a callback
   * is provided.
   * @param enabled New toggle value
   */
  function handleLineSpacingChange(enabled: boolean): void {
    setIncreasedLineSpacing(enabled);
    onLineSpacingChange?.(enabled);
  }

  /**
   * Handles focus mode toggle; bubbles up to LabInner when a callback
   * is provided.
   * @param enabled New toggle value
   */
  function handleFocusModeChange(enabled: boolean): void {
    setFocusMode(enabled);
    onFocusModeChange?.(enabled);
  }

  /**
   * Handles locale selection from LocalePicker.
   * Persists the choice to prefsStore keyed by session, then propagates to
   * the parent via onLocaleChange.
   * @param l Newly selected locale tag
   */
  function handleLocaleChange(l: SupportedLocale): void {
    if (activeSession !== null) {
      void prefsStore.set(`nblab.locale.${activeSession.id}`, l);
    }
    onLocaleChange(l);
  }

  /**
   * Handles theme selection from ThemePicker.
   * Persists the choice to prefsStore keyed by session, then propagates to
   * the parent via onThemeChange.
   * @param t Newly selected theme value
   */
  function handleThemeChange(t: LabTheme): void {
    if (activeSession !== null) {
      void prefsStore.set(`nblab.theme.${activeSession.id}`, t);
    }
    onThemeChange(t);
  }

  /**
   * Signs out of the current session: clears the active-id in the catalog
   * then dispatches CLEAR_SESSION to reset React state.
   */
  async function handleSignOut(): Promise<void> {
    if (disabled) return;
    setBusy(true);
    try {
      await signOut();
      dispatch({type: 'CLEAR_SESSION'});
    } finally {
      setBusy(false);
    }
  }

  /**
   * Deletes the current session after user confirmation.
   * Purges all associated notebooks first (cascade), then removes the session
   * record from the catalog, then clears React state.
   */
  async function handleDeleteSession(): Promise<void> {
    if (disabled || activeSession === null) return;
    const confirmed = window.confirm(STR_DELETE_CONFIRM);
    if (!confirmed) return;

    setBusy(true);
    try {
      // Cascade: remove all notebook records before removing the session entry.
      await deleteNotebooks(activeSession.id);
      await deleteSessionFromCatalog(activeSession.id);
      dispatch({type: 'CLEAR_SESSION'});
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{maxWidth: 480, mx: 'auto', mt: 4, px: 2}}>
      <Typography variant="h5" gutterBottom>
        {STR_HEADING}
      </Typography>

      {/* Language section */}
      <Box sx={{mt: 3}}>
        <Typography variant="subtitle2" gutterBottom>
          {STR_LANGUAGE_HEADING}
        </Typography>
        <LocalePicker locale={locale} onLocaleChange={handleLocaleChange} />
      </Box>

      {/* Theme section */}
      <Box sx={{mt: 3}}>
        <Typography variant="subtitle2" gutterBottom>
          {STR_THEME_HEADING}
        </Typography>
        <ThemePicker theme={theme} onThemeChange={handleThemeChange} />
      </Box>

      {/* Accessibility section */}
      <Box sx={{mt: 3}}>
        <Typography variant="subtitle2" gutterBottom>
          {STR_ACCESSIBILITY_HEADING}
        </Typography>
        <AccessibilityPanel
          readAloud={readAloud}
          onReadAloudChange={setReadAloud}
          openDyslexicFont={openDyslexicFont}
          onFontChange={handleFontChange}
          increasedLineSpacing={increasedLineSpacing}
          onLineSpacingChange={handleLineSpacingChange}
          focusMode={focusMode}
          onFocusModeChange={handleFocusModeChange}
        />
      </Box>

      <Divider sx={{my: 3}} />

      {/* Session lifecycle section */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {STR_SESSION_HEADING}
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <Button
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={() => void handleSignOut()}
          >
            {STR_SIGN_OUT}
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={disabled}
            onClick={() => void handleDeleteSession()}
          >
            {STR_DELETE}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
