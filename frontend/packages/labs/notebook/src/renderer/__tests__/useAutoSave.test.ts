/**
 * Tests for the useAutoSave save-status state machine.
 *
 * Uses fake timers to control debounce and reset delays without
 * real wall-clock waits.
 */

import {renderHook, act} from '@testing-library/react';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';

import type {Notebook} from '../../storage/NotebookLabDB';
import {useAutoSave} from '../useAutoSave';

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted ensures the variable is initialized before vi.mock is
// hoisted to the top of the compiled output.
// ---------------------------------------------------------------------------

/** Controlled mock for saveNotebook. */
const {mockSaveNotebook} = vi.hoisted(() => ({
  mockSaveNotebook: vi.fn(),
}));

vi.mock('../../storage/notebookRepo', () => ({
  saveNotebook: mockSaveNotebook,
}));

vi.mock('../../telemetry/wrapper', () => ({
  trackEvent: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a minimal Notebook fixture. */
function makeNotebook(title = 'Test'): Notebook {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {title},
    cells: [],
  };
}

/** Stable IDs used across tests. */
const NOTEBOOK_ID = 'nb-abc';
/** Stable session ID used across tests. */
const SESSION_ID = 'sess-xyz';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSaveNotebook.mockClear();
    mockSaveNotebook.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('idle → saving → saved → idle state machine', async () => {
    const notebook = makeNotebook();
    const {result} = renderHook(() =>
      useAutoSave(NOTEBOOK_ID, SESSION_ID, notebook)
    );

    // Initially idle.
    expect(result.current.status).toBe('idle');

    // After the 2 s debounce, status should become 'saving'.
    await act(async () => {
      vi.advanceTimersByTime(2000);
      // Let the microtask queue drain so the .then() resolves.
      await Promise.resolve();
    });

    expect(mockSaveNotebook).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('saved');

    // After another 2 s the reset timer fires → back to 'idle'.
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.status).toBe('idle');
  });

  it('sets status to error when saveNotebook rejects', async () => {
    mockSaveNotebook.mockRejectedValue(new Error('disk full'));
    const notebook = makeNotebook();
    const {result} = renderHook(() =>
      useAutoSave(NOTEBOOK_ID, SESSION_ID, notebook)
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    expect(result.current.status).toBe('error');
  });

  it('debounce resets on rapid changes — saveNotebook is called only once', async () => {
    let notebook = makeNotebook('v1');

    const {result, rerender} = renderHook(
      ({nb}: {nb: Notebook}) => useAutoSave(NOTEBOOK_ID, SESSION_ID, nb),
      {initialProps: {nb: notebook}}
    );
    void result; // status not under test here

    // Simulate 5 rapid edits within 1 s, each re-triggering the debounce.
    for (let i = 2; i <= 5; i++) {
      notebook = makeNotebook(`v${i}`);
      await act(async () => {
        vi.advanceTimersByTime(200);
        rerender({nb: notebook});
      });
    }

    // Still within the debounce window — no save yet.
    expect(mockSaveNotebook).not.toHaveBeenCalled();

    // Now let the debounce fully expire.
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    // Despite 5 re-renders, only one actual write.
    expect(mockSaveNotebook).toHaveBeenCalledOnce();
  });

  it('flushNow saves immediately without waiting for debounce', async () => {
    const notebook = makeNotebook();
    const {result} = renderHook(() =>
      useAutoSave(NOTEBOOK_ID, SESSION_ID, notebook)
    );

    // Call flushNow before the 2 s debounce expires.
    await act(async () => {
      result.current.flushNow();
      await Promise.resolve();
    });

    expect(mockSaveNotebook).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('saved');
  });

  it('visibilitychange to hidden triggers an immediate flush', async () => {
    const notebook = makeNotebook();
    renderHook(() => useAutoSave(NOTEBOOK_ID, SESSION_ID, notebook));

    // Simulate the page becoming hidden before the debounce fires.
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });

    expect(mockSaveNotebook).toHaveBeenCalledOnce();

    // Restore so other tests are not affected.
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
  });
});
