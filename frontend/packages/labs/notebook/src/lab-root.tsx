/**
 * lab-root — top-level entry component for the K-12 Notebook Lab.
 *
 * Owns provider composition and cold-open dispatch.  The channelId
 * from the studio router determines which view is shown on first load.
 *
 * Dispatch table (from url-contracts.md):
 *   'default' + no session  → SessionGate shows SessionPicker
 *   'default' + session + no welcome flag  → show welcome notebook
 *   'default' + session + welcome flag  → notebook index placeholder
 *   'new' + session  → force welcome notebook
 *   UUID + session + found  → open that notebook
 *   UUID + session + not found  → not-found placeholder
 */

import {Box, BottomNavigation, BottomNavigationAction, CircularProgress, SvgIcon, Typography} from '@mui/material';
import {useCallback, useEffect, useState} from 'react';

import './theme/opendyslexic.css';
import './theme/accessibility.css';
import type {CompletionArtifact} from './artifact/artifactPayload';
import {decodeArtifact} from './artifact/codec';
import {CompletionArtifact as CompletionArtifactView} from './artifact/CompletionArtifact';
import type {SupportedLocale} from './i18n/localeMeta';
import {DEFAULT_LOCALE, LOCALE_META} from './i18n/localeMeta';
import {StringsProvider} from './i18n/StringsProvider';
import {IndexView} from './index/IndexView';
import {CompletionProvider} from './progress/completionStore';
import {NotebookView} from './renderer/NotebookView';
import {useAutoSave} from './renderer/useAutoSave';
import {PyodideProvider} from './runtime/PyodideProvider';
import {SessionGate} from './session/SessionGate';
import {SessionProvider, useSession} from './session/sessionStore';
import {SettingsView} from './settings/SettingsView';
import {rewriteGithubUrl} from './storage/githubUrl';
import {importFromUrl} from './storage/importer';
import type {Notebook} from './storage/NotebookLabDB';
import {saveNotebook, getNotebook} from './storage/notebookRepo';
import * as prefsStore from './storage/prefsStore';
import {seedSessionIfEmpty} from './storage/seeder';
import {trackEvent} from './telemetry/wrapper';
import type {LabTheme} from './theme/index';
import {hasSeenWelcome, markWelcomeSeen} from './welcome/welcomeFlag';
import {buildWelcomeNotebook} from './welcome/welcomeNotebook';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all views the lab root may display.
 * 'loading' covers the async dispatch phase before a view is resolved.
 * 'settings' is the session-lifecycle settings page added in Phase 8.
 * 'artifact' is a stateless read-only view decoded from the URL hash (Phase 13).
 */
type LabView =
  | {kind: 'loading'}
  | {kind: 'notebook'; notebook: Notebook; notebookId: string}
  | {kind: 'index'}
  | {kind: 'not-found'}
  | {kind: 'settings'}
  | {kind: 'artifact'; artifact: CompletionArtifact};

// ---------------------------------------------------------------------------
// Bottom nav icons (inline SVG — @mui/icons-material not yet installed)
// ---------------------------------------------------------------------------

/**
 * BookmarksIcon — inline SVG for the Notebooks tab.
 * Path data mirrors Material Design "bookmarks" icon.
 */
function BookmarksIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M17 11.67V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14l5-3 5 3V8h2a1 1 0 0 1 1 1v2.67l2 1.16V8h2l-2-1.16zM10 15l-3 1.8V6h6v10.8l-3-1.8z" />
    </SvgIcon>
  );
}

/**
 * SettingsIcon — inline SVG for the Settings tab.
 * Path data mirrors Material Design "settings" icon.
 */
function SettingsIcon(): React.ReactElement {
  return (
    <SvgIcon>
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a7.01 7.01 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </SvgIcon>
  );
}

// ---------------------------------------------------------------------------
// Top-level props
// ---------------------------------------------------------------------------

/**
 * Top-level props for the Notebook Lab entry component.
 */
export interface NotebookLabProps {
  /** Code.org channel ID identifying the project to load. */
  channelId: string;
}

// ---------------------------------------------------------------------------
// Inner component (needs session context)
// ---------------------------------------------------------------------------

/** Props forwarded from NotebookLab into the inner component. */
interface LabInnerProps {
  /** Channel id from the studio router. */
  channelId: string;
  /** Active locale for i18n. */
  locale: SupportedLocale;
  /** Active visual theme. */
  theme: LabTheme;
  /**
   * Callback to update the active locale, owned by NotebookLab.
   * @param l New locale tag
   */
  onLocaleChange: (l: SupportedLocale) => void;
  /**
   * Callback to update the active theme, owned by NotebookLab.
   * @param t New theme value
   */
  onThemeChange: (t: LabTheme) => void;
}

/**
 * Saves a welcome notebook and returns the generated notebook id.
 * Extracted to keep the dispatch effect body readable.
 * @param sessionId Active session identifier
 * @returns Tuple of [notebookId, notebook]
 */
async function createAndSaveWelcomeNotebook(
  sessionId: string
): Promise<[string, Notebook]> {
  const nb = buildWelcomeNotebook();
  const nbId = crypto.randomUUID();
  await saveNotebook(sessionId, {
    notebookId: nbId,
    sessionId,
    notebook: nb,
    created: Date.now(),
    source: 'welcome',
  });
  return [nbId, nb];
}

/**
 * AutoSaveWatcher — mounts useAutoSave when a notebook view is active.
 * Split out so the hook is only called conditionally via a mounted component,
 * avoiding the "hooks must not be called conditionally" rule.
 */
interface AutoSaveWatcherProps {
  /** Notebook id to save under. */
  notebookId: string;
  /** Active session id. */
  sessionId: string;
  /** Current notebook document. */
  notebook: Notebook | null;
}

/**
 * Thin wrapper that runs the autosave hook and renders nothing visible.
 * The save status is not yet surfaced in the UI (planned for Phase 5 toolbar).
 * `flushNow` is available for future callers (e.g. route-change handlers).
 */
function AutoSaveWatcher({
  notebookId,
  sessionId,
  notebook,
}: AutoSaveWatcherProps): null {
  // Destructure the new return shape; flushNow is retained for future wiring.
  const {flushNow} = useAutoSave(notebookId, sessionId, notebook, 'welcome');
  // Suppress unused-variable warning until Phase 8 wires flushNow to navigation.
  void flushNow;
  return null;
}

// ---------------------------------------------------------------------------
// Bottom nav tab indices
// ---------------------------------------------------------------------------

/** Tab index for the Notebooks list in BottomNavigation. */
const NAV_TAB_NOTEBOOKS = 0;

/** Tab index for the Settings page in BottomNavigation. */
const NAV_TAB_SETTINGS = 1;

// ---------------------------------------------------------------------------
// LabInner
// ---------------------------------------------------------------------------

/**
 * Renders the current view based on the resolved LabView.
 * Loads persisted locale and theme from prefsStore when the active session
 * is first resolved so returning learners see their previous preference.
 *
 * Phase 16: owns OpenDyslexic font, line spacing, and focus mode state so
 * that data-* attributes can be applied to the root Box element.  Callbacks
 * are passed down to SettingsView via AccessibilityPanel.
 */
function LabInner({channelId, locale, theme, onLocaleChange, onThemeChange}: LabInnerProps): React.ReactElement {
  const {activeSession} = useSession();
  const [view, setView] = useState<LabView>({kind: 'loading'});
  const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(null);

  // ---------------------------------------------------------------------------
  // Accessibility data-attribute state (no persistence — Phase 16 stub)
  // ---------------------------------------------------------------------------

  /** Whether the OpenDyslexic font is active; drives data-font attribute. */
  const [openDyslexicFont, setOpenDyslexicFont] = useState(false);
  /** Whether increased line spacing is active; drives data-line-spacing attribute. */
  const [increasedLineSpacing, setIncreasedLineSpacing] = useState(false);
  /** Whether focus mode is active; drives data-focus-mode attribute. */
  const [focusMode, setFocusMode] = useState(false);

  // Load persisted locale and theme once the active session is known.
  useEffect(() => {
    if (activeSession === null) return;
    const sessionId = activeSession.id;

    async function loadPrefs(): Promise<void> {
      const [savedLocale, savedTheme] = await Promise.all([
        prefsStore.get<SupportedLocale>(`nblab.locale.${sessionId}`),
        prefsStore.get<LabTheme>(`nblab.theme.${sessionId}`),
      ]);
      if (savedLocale !== null) {
        onLocaleChange(savedLocale);
      }
      if (savedTheme !== null) {
        onThemeChange(savedTheme);
      }
    }

    void loadPrefs();
  // Intentionally run only when the session id changes, not on every
  // onLocaleChange / onThemeChange reference update.
  }, [activeSession?.id]);

  // Handle ?github= deep-link on first mount: import the notebook then strip the param.
  useEffect(() => {
    if (activeSession === null) return;
    const params = new URLSearchParams(window.location.search);
    const githubParam = params.get('github');
    if (githubParam === null) return;

    const sessionId = activeSession.id;
    const rawUrl = rewriteGithubUrl(`https://github.com/${githubParam}`);

    async function handleGithubImport(): Promise<void> {
      trackEvent('nblab.import.attempt', {source: 'import-github'});
      try {
        const result = await importFromUrl(rawUrl, sessionId, 'import-github');
        trackEvent('nblab.import.success', {source: 'import-github'});
        // Strip the ?github= param from the address bar.
        const clean = new URL(window.location.href);
        clean.searchParams.delete('github');
        window.history.replaceState(null, '', clean.toString());
        setCurrentNotebook(result.notebook);
        setView({kind: 'notebook', notebook: result.notebook, notebookId: result.notebookId});
      } catch {
        trackEvent('nblab.import.failure', {source: 'import-github'});
      }
    }

    void handleGithubImport();
  }, [activeSession?.id]);

  // Dispatch: resolve channelId + session state → LabView.
  useEffect(() => {
    let cancelled = false;

    async function dispatch(): Promise<void> {
      setView({kind: 'loading'});

      // SessionGate guarantees activeSession is non-null when LabInner renders.
      if (activeSession === null) return;

      const sessionId = activeSession.id;

      // Non-blocking: seed the sample library in the background.
      void seedSessionIfEmpty(sessionId);

      // Artifact route: decode the completion artifact from the URL hash.
      // NOTE: ideally the artifact view would not be gated by SessionGate since
      // it is stateless.  For now it renders inside the session gate, meaning
      // the learner must have an active session to view a shared artifact.
      // TODO: lift artifact view outside SessionGate in a future phase.
      if (channelId === 'artifact') {
        const hash = window.location.hash;
        const match = hash.match(/^#artifact=(.+)$/);
        if (match !== null) {
          try {
            const artifact = decodeArtifact(match[1]);
            if (!cancelled) {
              setView({kind: 'artifact', artifact});
            }
          } catch {
            if (!cancelled) setView({kind: 'not-found'});
          }
        } else {
          if (!cancelled) setView({kind: 'not-found'});
        }
        return;
      }

      if (channelId === 'new') {
        const [nbId, nb] = await createAndSaveWelcomeNotebook(sessionId);
        await markWelcomeSeen(sessionId);
        if (!cancelled) {
          setCurrentNotebook(nb);
          setView({kind: 'notebook', notebook: nb, notebookId: nbId});
        }
        return;
      }

      if (channelId === 'default') {
        const seen = await hasSeenWelcome(sessionId);
        if (seen) {
          if (!cancelled) setView({kind: 'index'});
          return;
        }
        const [nbId, nb] = await createAndSaveWelcomeNotebook(sessionId);
        await markWelcomeSeen(sessionId);
        if (!cancelled) {
          setCurrentNotebook(nb);
          setView({kind: 'notebook', notebook: nb, notebookId: nbId});
        }
        return;
      }

      // Treat channelId as a UUID and attempt to load the notebook.
      const record = await getNotebook(sessionId, channelId);
      if (cancelled) return;
      if (record !== undefined) {
        setCurrentNotebook(record.notebook);
        setView({kind: 'notebook', notebook: record.notebook, notebookId: channelId});
      } else {
        setView({kind: 'not-found'});
      }
    }

    void dispatch();
    return () => {
      cancelled = true;
    };
  }, [activeSession, channelId]);

  /**
   * Handles notebook-level changes propagated from NotebookView.
   * Keeps currentNotebook in sync so useAutoSave sees the latest version.
   * @param updated Updated notebook document
   */
  function handleNotebookChange(updated: Notebook): void {
    setCurrentNotebook(updated);
  }

  /**
   * Opens a notebook by id: loads the record from IndexedDB and transitions
   * to the notebook view.  Called from IndexView when the user taps a card.
   * @param notebookId Stable id of the notebook to open
   */
  const handleOpenNotebook = useCallback(
    async (notebookId: string): Promise<void> => {
      if (activeSession === null) return;
      const record = await getNotebook(activeSession.id, notebookId);
      if (record !== undefined) {
        setCurrentNotebook(record.notebook);
        setView({kind: 'notebook', notebook: record.notebook, notebookId});
      }
    },
    [activeSession]
  );

  /**
   * Navigates back to the index view from inside a notebook.
   * Clears the current notebook state so stale data is not shown on re-entry.
   */
  function handleBackToIndex(): void {
    setCurrentNotebook(null);
    setView({kind: 'index'});
  }

  /**
   * Handles BottomNavigation tab changes.
   * "Notebooks" (0) navigates to index if in notebook view; "Settings" (1)
   * always navigates to the settings view.
   * @param _evt The synthetic event (unused)
   * @param newValue The newly selected tab index
   */
  function handleNavChange(_evt: React.SyntheticEvent, newValue: number): void {
    if (newValue === NAV_TAB_NOTEBOOKS) {
      if (view.kind === 'notebook') {
        handleBackToIndex();
      }
      // Already at index: no-op.
    } else if (newValue === NAV_TAB_SETTINGS) {
      setView({kind: 'settings'});
    }
  }

  /**
   * Resolves the active tab index for BottomNavigation based on the current view.
   * @returns Tab index matching the current view kind.
   */
  function resolveNavTab(): number {
    if (view.kind === 'settings') return NAV_TAB_SETTINGS;
    return NAV_TAB_NOTEBOOKS;
  }

  return (
    <Box
      data-dir={LOCALE_META[locale].direction}
      data-font={openDyslexicFont ? 'opendyslexic' : undefined}
      data-line-spacing={increasedLineSpacing ? 'increased' : undefined}
      data-focus-mode={focusMode ? 'on' : undefined}
      sx={{height: '100%', display: 'flex', flexDirection: 'column'}}
    >
      <Box sx={{flex: 1, overflow: 'auto'}}>
        {view.kind === 'loading' && (
          <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            <CircularProgress />
          </Box>
        )}
        {view.kind === 'index' && (
          <IndexView onOpenNotebook={id => void handleOpenNotebook(id)} />
        )}
        {view.kind === 'settings' && (
          <SettingsView
            locale={locale}
            theme={theme}
            onLocaleChange={onLocaleChange}
            onThemeChange={onThemeChange}
            onFontChange={setOpenDyslexicFont}
            onLineSpacingChange={setIncreasedLineSpacing}
            onFocusModeChange={setFocusMode}
          />
        )}
        {view.kind === 'not-found' && (
          <Typography>Notebook not found in this session.</Typography>
        )}
        {view.kind === 'artifact' && (
          <CompletionArtifactView artifact={view.artifact} />
        )}
        {view.kind === 'notebook' && (
          <>
            <AutoSaveWatcher
              notebookId={view.notebookId}
              sessionId={activeSession?.id ?? ''}
              notebook={currentNotebook}
            />
            <CompletionProvider>
              <NotebookView
                notebook={currentNotebook ?? view.notebook}
                notebookId={view.notebookId}
                locale={locale}
                onNotebookChange={handleNotebookChange}
                onBack={handleBackToIndex}
                onOpenNotebook={id => void handleOpenNotebook(id)}
                nextNotebookId={null}
                sessionLabel={activeSession?.label ?? ''}
              />
            </CompletionProvider>
          </>
        )}
      </Box>

      {view.kind !== 'loading' && (
        <BottomNavigation
          value={resolveNavTab()}
          onChange={handleNavChange}
          showLabels
          sx={{borderTop: 1, borderColor: 'divider', flexShrink: 0}}
        >
          <BottomNavigationAction
            label="Notebooks"
            icon={<BookmarksIcon />}
            value={NAV_TAB_NOTEBOOKS}
          />
          <BottomNavigationAction
            label="Settings"
            icon={<SettingsIcon />}
            value={NAV_TAB_SETTINGS}
          />
        </BottomNavigation>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

/**
 * Root component for the K-12 Notebook Lab.
 *
 * Composes providers and hands off to LabInner which resolves the
 * cold-open dispatch once session state is available.
 *
 * Owns locale and theme state.  Both are persisted per-session in LabInner
 * once a session is resolved; the root holds the React source-of-truth.
 */
export default function NotebookLab({channelId}: NotebookLabProps): React.ReactElement {
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [theme, setTheme] = useState<LabTheme>('dark');

  // Keep the HTML root element's lang/dir attributes in sync so that
  // the browser applies correct font shaping and bidi layout for the
  // active locale (T020).
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_META[locale].direction;
  }, [locale]);

  return (
    <StringsProvider locale={locale}>
      <SessionProvider>
        <SessionGate>
          <PyodideProvider>
            <LabInner
              channelId={channelId}
              locale={locale}
              theme={theme}
              onLocaleChange={setLocale}
              onThemeChange={setTheme}
            />
          </PyodideProvider>
        </SessionGate>
      </SessionProvider>
    </StringsProvider>
  );
}
