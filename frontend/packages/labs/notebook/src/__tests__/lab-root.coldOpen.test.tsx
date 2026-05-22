/**
 * Cold-open dispatch tests for the Notebook Lab root component.
 *
 * Verifies that the correct view is shown for each combination of
 * channelId and session state, as specified in url-contracts.md.
 *
 * Mocks all I/O boundaries (notebookRepo, welcomeFlag, sessionStore,
 * PyodideProvider) so the tests run synchronously in jsdom without
 * IndexedDB or real prefs storage.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import type {Session} from '../storage/sessionRepo';
import type {Notebook, NotebookRecord} from '../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Mocks declared before any imports that trigger module evaluation.
// ---------------------------------------------------------------------------

vi.mock('../storage/notebookRepo', () => ({
  saveNotebook: vi.fn().mockResolvedValue(undefined),
  getNotebook: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../welcome/welcomeFlag', () => ({
  hasSeenWelcome: vi.fn().mockResolvedValue(false),
  markWelcomeSeen: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../session/sessionStore', async importOriginal => {
  const real = await importOriginal<typeof import('../session/sessionStore')>();
  return {
    ...real,
    useSession: vi.fn().mockReturnValue({activeSession: null, idleTimeoutMs: 1_200_000}),
  };
});

vi.mock('../runtime/PyodideProvider', () => ({
  PyodideProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Stub SessionPicker so the cold-open dispatch test stays focused on routing,
// not on session-picker UI or sessionRepo I/O.
vi.mock('../session/SessionPicker', () => ({
  SessionPicker: () => <div>Session picker</div>,
}));

// Mock NotebookView to avoid the CodeCell → RuntimeContext dependency chain.
// The cold-open tests care about which view is displayed, not cell rendering.
vi.mock('../renderer/NotebookView', () => ({
  NotebookView: ({notebook}: {notebook: {metadata: {title?: string}}; locale: string; onNotebookChange: () => void}) => (
    <div data-testid="notebook-view">{notebook.metadata.title ?? 'Untitled'}</div>
  ),
}));

// Mock IndexView so the cold-open routing test does not need to provide
// a full IndexedDB + session context.  The test only cares that the index
// route is reached, not about IndexView's internal rendering.
vi.mock('../index/IndexView', () => ({
  IndexView: () => <div data-testid="index-view">Notebook index</div>,
}));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import NotebookLab from '../lab-root';
import {saveNotebook, getNotebook} from '../storage/notebookRepo';
import {hasSeenWelcome, markWelcomeSeen} from '../welcome/welcomeFlag';
import {useSession} from '../session/sessionStore';
import {WELCOME_NOTEBOOK_TITLE} from '../welcome/welcomeNotebook';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a minimal Session fixture. */
function makeSession(id = 'session-abc'): Session {
  return {id, label: 'Test', created: 0, lastActive: 0};
}

/** Builds a minimal Notebook fixture for getNotebook mocks. */
function makeNotebookRecord(title = 'Test Notebook'): NotebookRecord {
  const nb: Notebook = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {title},
    cells: [],
  };
  return {
    key: 'session-abc::notebook-uuid',
    notebookId: 'notebook-uuid',
    sessionId: 'session-abc',
    notebook: nb,
    created: 0,
    lastModified: 0,
    source: 'import-file',
  };
}

/** Convenience wrapper to render NotebookLab with a given channelId. */
function renderLab(channelId: string) {
  return render(<NotebookLab channelId={channelId} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NotebookLab cold-open dispatch', () => {
  beforeEach(() => {
    vi.mocked(saveNotebook).mockResolvedValue(undefined);
    vi.mocked(getNotebook).mockResolvedValue(undefined);
    vi.mocked(hasSeenWelcome).mockResolvedValue(false);
    vi.mocked(markWelcomeSeen).mockResolvedValue(undefined);
  });

  it('channelId=default with no session shows session picker', async () => {
    vi.mocked(useSession).mockReturnValue({activeSession: null, idleTimeoutMs: 1_200_000});
    renderLab('default');
    await waitFor(() => {
      expect(screen.getByText(/Session picker/i)).toBeTruthy();
    });
  });

  it('channelId=default with session + no welcome flag calls saveNotebook and shows notebook view', async () => {
    const session = makeSession();
    vi.mocked(useSession).mockReturnValue({activeSession: session, idleTimeoutMs: 1_200_000});
    vi.mocked(hasSeenWelcome).mockResolvedValue(false);

    renderLab('default');

    await waitFor(() => {
      expect(saveNotebook).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText(WELCOME_NOTEBOOK_TITLE)).toBeTruthy();
    });
  });

  it('channelId=default with session + welcome flag shows notebook index', async () => {
    const session = makeSession();
    vi.mocked(useSession).mockReturnValue({activeSession: session, idleTimeoutMs: 1_200_000});
    vi.mocked(hasSeenWelcome).mockResolvedValue(true);

    renderLab('default');

    await waitFor(() => {
      expect(screen.getByText(/Notebook index/i)).toBeTruthy();
    });
  });

  it('channelId=new with session calls saveNotebook and shows notebook view', async () => {
    const session = makeSession();
    vi.mocked(useSession).mockReturnValue({activeSession: session, idleTimeoutMs: 1_200_000});

    renderLab('new');

    await waitFor(() => {
      expect(saveNotebook).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText(WELCOME_NOTEBOOK_TITLE)).toBeTruthy();
    });
  });

  it('UUID channelId with getNotebook returning a record shows notebook view', async () => {
    const session = makeSession();
    const record = makeNotebookRecord('My Notebook');
    vi.mocked(useSession).mockReturnValue({activeSession: session, idleTimeoutMs: 1_200_000});
    vi.mocked(getNotebook).mockResolvedValue(record);

    renderLab('notebook-uuid');

    await waitFor(() => {
      expect(screen.getByText('My Notebook')).toBeTruthy();
    });
  });

  it('UUID channelId with getNotebook returning undefined shows not-found text', async () => {
    const session = makeSession();
    vi.mocked(useSession).mockReturnValue({activeSession: session, idleTimeoutMs: 1_200_000});
    vi.mocked(getNotebook).mockResolvedValue(undefined);

    renderLab('some-uuid-that-does-not-exist');

    await waitFor(() => {
      expect(screen.getByText(/Notebook not found in this session/i)).toBeTruthy();
    });
  });
});
