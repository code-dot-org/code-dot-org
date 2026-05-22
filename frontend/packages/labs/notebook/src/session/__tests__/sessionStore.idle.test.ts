/**
 * Idle-timeout tests for SessionProvider / useSession.
 *
 * The idle timer is set up inside a useEffect that reads idleTimeoutMs from
 * state.  The provider bootstraps from a catalog loaded via prefsStore.get.
 * These tests confirm that after the configured idle period elapses with no
 * activity events, activeSession becomes null.
 *
 * prefsStore and sessionRepo are mocked to avoid real IDB / localStorage I/O.
 * vi.useFakeTimers() controls setTimeout so the 20-minute timeout fires
 * synchronously inside act().
 *
 * waitFor is intentionally avoided: it polls via setTimeout, which deadlocks
 * when fake timers are active.  Instead the bootstrap promise is flushed via
 * repeated await-Promise.resolve() calls inside act(), which safely drains
 * the microtask queue without touching fake macrotask scheduling.
 */

import React from 'react';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import type {Session} from '../../storage/sessionRepo';

// ---------------------------------------------------------------------------
// Hoisted mock state
// ---------------------------------------------------------------------------

/**
 * Mutable return value for prefsStore.get — replaced per test.
 */
const mockPrefs = vi.hoisted(() => ({
  catalogValue: null as object | null,
}));

// ---------------------------------------------------------------------------
// Module mocks — declared before the module under test is imported.
// ---------------------------------------------------------------------------

vi.mock('../../storage/prefsStore', () => ({
  /**
   * Returns the current mock catalog value.  Matches the key the bootstrap
   * effect passes ('nblab.sessionCatalog').
   * @param _key Ignored in the mock.
   * @returns Resolved mock catalog or null.
   */
  get: vi.fn(async (_key: string) => mockPrefs.catalogValue),
  /**
   * No-op set — tests do not inspect persisted prefs writes.
   */
  set: vi.fn(async () => undefined),
  /**
   * No-op remove.
   */
  remove: vi.fn(async () => undefined),
}));

vi.mock('../../storage/sessionRepo', () => ({
  /**
   * No-op signOut — the test only cares about the React state transition,
   * not the side-effect write to the catalog.
   */
  signOut: vi.fn(async () => undefined),
  activateSession: vi.fn(async () => undefined),
  touchLastActive: vi.fn(async () => undefined),
}));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import {SessionProvider, useSession} from '../sessionStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * A minimal consumer that renders the current activeSession id (or 'null')
 * so tests can assert state changes via the DOM.
 * @returns React element displaying the active session id.
 */
function SessionDisplay(): React.ReactElement {
  const {activeSession} = useSession();
  return React.createElement(
    'span',
    {'data-testid': 'session-id'},
    activeSession !== null ? activeSession.id : 'null'
  );
}

/**
 * Renders SessionProvider with SessionDisplay and returns the display element.
 * @returns The rendered span element.
 */
function renderProvider(): HTMLElement {
  render(
    React.createElement(SessionProvider, null, React.createElement(SessionDisplay))
  );
  return screen.getByTestId('session-id');
}

/**
 * Builds a minimal catalog blob that the bootstrap effect accepts.
 * @param session Session to mark as active.
 * @param idleTimeoutMs Idle timeout in milliseconds.
 * @returns Plain object matching the catalog schema.
 */
function makeCatalog(
  session: Session,
  idleTimeoutMs: number
): object {
  return {
    sessions: [session],
    activeId: session.id,
    idleTimeoutMs,
  };
}

/**
 * Builds a minimal Session fixture.
 * @param id Session identifier.
 * @returns Session object.
 */
function makeSession(id: string): Session {
  const now = Date.now();
  return {id, label: 'Test', created: now, lastActive: now};
}

/**
 * Flushes the microtask queue inside an act() boundary.
 *
 * The bootstrap effect chains one async call (prefsStore.get), so two
 * promise-resolve ticks are enough to drain it in practice.  Extra ticks are
 * cheap and guard against deeper chains added later.
 * @returns Promise that resolves after microtasks are drained.
 */
async function flushBootstrap(): Promise<void> {
  await act(async () => {
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
    }
  });
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Do not fake microtask scheduling (Promise/queueMicrotask) — only fake
  // macrotask timers.  This keeps act(async () => await Promise.resolve())
  // functional while still letting vi.advanceTimersByTime control setTimeout.
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']});
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionProvider idle timeout', () => {
  it('clears activeSession after the configured idle period elapses', async () => {
    const session = makeSession('session-idle-test');
    // The provider reads idleTimeoutMs from the catalog; set it to the default
    // 20-minute (1,200,000 ms) value to mirror production behaviour.
    mockPrefs.catalogValue = makeCatalog(session, 1_200_000);

    const el = renderProvider();

    // Let the bootstrap effect's async chain resolve so SET_SESSION fires.
    await flushBootstrap();
    expect(el.textContent).toBe('session-idle-test');

    // Advance time past the idle threshold — the timeout callback fires and
    // dispatches CLEAR_SESSION.  Flush the microtasks queued by signOut.
    await act(async () => {
      vi.advanceTimersByTime(1_200_001);
      await Promise.resolve();
    });

    expect(el.textContent).toBe('null');
  });

  it('does not clear activeSession before the idle period elapses', async () => {
    const session = makeSession('session-active');
    mockPrefs.catalogValue = makeCatalog(session, 1_200_000);

    const el = renderProvider();

    await flushBootstrap();
    expect(el.textContent).toBe('session-active');

    // Advance only 19 minutes and 59 seconds — threshold not yet crossed.
    await act(async () => {
      vi.advanceTimersByTime(1_199_999);
    });

    // Session must still be present.
    expect(el.textContent).toBe('session-active');
  });
});
