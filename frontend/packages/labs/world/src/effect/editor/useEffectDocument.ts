import {useCallback, useMemo, useReducer} from 'react';

import type {EffectDocument} from '../model/types';

export interface UseEffectDocumentResult {
  document: EffectDocument;
  /** Apply a change and push the previous document onto the undo stack. */
  update: (
    change: (current: EffectDocument) => EffectDocument,
    options?: {coalesce?: string},
  ) => void;
  /** Replace the document outright, clearing history — e.g. on file open. */
  reset: (next: EffectDocument) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const HISTORY_LIMIT = 100;

interface HistoryState {
  past: EffectDocument[];
  present: EffectDocument;
  future: EffectDocument[];
  /**
   * Key of the run of edits currently being merged into one history entry, or
   * null when the next edit starts a new one.
   */
  coalesceKey: string | null;
}

type HistoryAction =
  | {
      type: 'update';
      change: (current: EffectDocument) => EffectDocument;
      coalesce?: string;
    }
  | {type: 'reset'; document: EffectDocument}
  | {type: 'undo'}
  | {type: 'redo'};

/**
 * A reducer rather than several `useState`s on purpose.
 *
 * The document and its history change together, and the obvious version —
 * calling `setPast` from inside the `setDocument` updater — is not safe: React
 * re-invokes updaters (twice in StrictMode, and again whenever it replays a
 * render), so the history would gain phantom entries. A reducer makes one
 * atomic, pure transition.
 */
function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case 'update': {
      const next = action.change(state.present);
      if (next === state.present) {
        return state;
      }

      const key = action.coalesce ?? null;
      // A run of edits sharing a key — a slider drag, a burst of typing —
      // is one undo step, not one per event.
      const continuing = key !== null && key === state.coalesceKey;

      return {
        past: continuing
          ? state.past
          : [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
        coalesceKey: key,
      };
    }

    case 'reset':
      return {
        past: [],
        present: action.document,
        future: [],
        coalesceKey: null,
      };

    case 'undo': {
      const previous = state.past.at(-1);
      if (!previous) {
        return state;
      }
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        coalesceKey: null,
      };
    }

    case 'redo': {
      const [next, ...rest] = state.future;
      if (!next) {
        return state;
      }
      return {
        past: [...state.past, state.present],
        present: next,
        future: rest,
        coalesceKey: null,
      };
    }

    default:
      return state;
  }
}

/**
 * Document state with undo/redo.
 *
 * `readOnly` is enforced here rather than only in the UI, and that is the
 * point: it is the one place every edit in the editor passes through, so a
 * control that forgets to disable itself still cannot change the file. The UI
 * disables those controls too — a field that accepts typing and discards it
 * reads as a bug — but this is what makes read-only true rather than intended.
 */
export function useEffectDocument(
  initial: EffectDocument,
  options: {readOnly?: boolean} = {},
): UseEffectDocumentResult {
  const {readOnly = false} = options;
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initial,
    future: [],
    coalesceKey: null,
  });

  const update = useCallback<UseEffectDocumentResult['update']>(
    (change, options) => {
      if (readOnly) {
        return;
      }
      dispatch({type: 'update', change, coalesce: options?.coalesce});
    },
    [readOnly],
  );

  const reset = useCallback(
    (next: EffectDocument) => dispatch({type: 'reset', document: next}),
    [],
  );

  const undo = useCallback(() => dispatch({type: 'undo'}), []);
  const redo = useCallback(() => dispatch({type: 'redo'}), []);

  return useMemo(
    () => ({
      document: state.present,
      update,
      reset,
      undo,
      redo,
      // Read-only reports no history rather than a disabled-looking one: with
      // no edit possible there is nothing to undo, and the buttons are already
      // driven by these two flags.
      canUndo: !readOnly && state.past.length > 0,
      canRedo: !readOnly && state.future.length > 0,
    }),
    [state, update, reset, undo, redo, readOnly],
  );
}
