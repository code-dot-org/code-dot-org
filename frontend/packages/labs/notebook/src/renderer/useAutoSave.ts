/**
 * useAutoSave — debounced autosave hook for the notebook renderer.
 *
 * Waits 2 s after the last notebook change before writing to IndexedDB.
 * Also flushes immediately on:
 *   - explicit `flushNow()` calls (e.g. from onBlur / route changes)
 *   - document `visibilitychange` events when the page becomes hidden
 *   - `pagehide` events (covers iOS Safari force-quit)
 *
 * Pending timers are cleared on unmount to prevent state updates on
 * an unmounted component.
 */

import {useState, useEffect, useRef, useCallback} from 'react';

import type {Notebook, NotebookSource} from '../storage/NotebookLabDB';
import {saveNotebook} from '../storage/notebookRepo';

/** Save status reported back to the calling component. */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Debounce delay in milliseconds before a pending save is flushed. */
const DEBOUNCE_MS = 2000;

/** Delay before resetting status from 'saved' back to 'idle'. */
const SAVED_RESET_MS = 2000;

/** Return value of the useAutoSave hook. */
export interface UseAutoSaveResult {
  /** Current save status. */
  status: SaveStatus;
  /**
   * Cancels any pending debounce timer and triggers a save immediately.
   * Safe to call when no notebook is loaded — it is a no-op in that case.
   */
  flushNow: () => void;
}

/**
 * Debounced autosave hook. Saves the notebook 2 s after the last change.
 * Exposes a `flushNow` callback for eager saves (focus loss, navigation, etc.).
 *
 * @param notebookId The notebook UUID to save under
 * @param sessionId The active session ID
 * @param notebook The current notebook document, or null when no notebook is loaded
 * @param source The originating source of this notebook (default: 'welcome')
 * @returns Object containing the current save status and a flushNow callback
 */
export function useAutoSave(
  notebookId: string,
  sessionId: string,
  notebook: Notebook | null,
  source: NotebookSource = 'welcome'
): UseAutoSaveResult {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a ref to the latest notebook so visibilitychange/pagehide handlers
  // can read the current value without stale-closure issues.
  const notebookRef = useRef<Notebook | null>(notebook);
  notebookRef.current = notebook;

  /**
   * Executes the save immediately, bypassing the debounce timer.
   * Cancels any pending debounce so only one save fires.
   */
  const executeSave = useCallback(() => {
    const current = notebookRef.current;
    if (current === null) return;

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setStatus('saving');

    const record = {
      notebookId,
      sessionId,
      notebook: current,
      created: Date.now(),
      source,
    };

    saveNotebook(sessionId, record)
      .then(() => {
        setStatus('saved');
        // Reset to idle after a brief confirmation period.
        resetRef.current = setTimeout(() => {
          setStatus('idle');
        }, SAVED_RESET_MS);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [notebookId, sessionId, source]);

  /**
   * Public flush callback. Cancels any pending debounce and saves now.
   * No-op when no notebook is currently loaded.
   */
  const flushNow = useCallback(() => {
    executeSave();
  }, [executeSave]);

  useEffect(() => {
    if (notebook === null) return;

    // Clear any pending debounce timer from a previous keystroke.
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      executeSave();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [notebook, executeSave]);

  // Register visibility and pagehide listeners for eager flush on hide/quit.
  useEffect(() => {
    /**
     * Flushes on document visibility change to hidden (tab switch,
     * app backgrounding, etc.).
     */
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        flushNow();
      }
    }

    /**
     * Flushes on pagehide, which fires on iOS Safari when the app is
     * force-quit or the page is evicted from the back-forward cache.
     */
    function handlePageHide(): void {
      flushNow();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [flushNow]);

  // Clear the saved-reset timer on unmount.
  useEffect(() => {
    return () => {
      if (resetRef.current !== null) {
        clearTimeout(resetRef.current);
      }
    };
  }, []);

  return {status, flushNow};
}
