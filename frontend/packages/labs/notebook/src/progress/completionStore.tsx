/**
 * completionStore — React context for tracking cell run records in memory.
 *
 * Stores a Map<notebookId, CellRunRecord[]> in context state. Completion state
 * is derived on demand by useCompletion from those records plus the caller's
 * list of runnable cell IDs; nothing is persisted to IndexedDB here.
 *
 * The store is cleared when the CompletionProvider unmounts (React state
 * lifecycle manages this automatically).
 */

import {createContext, useCallback, useContext, useReducer} from 'react';
import type {CellRunRecord, CompletionState} from './lessonCompletion';

// ---------------------------------------------------------------------------
// Store state and actions
// ---------------------------------------------------------------------------

/**
 * Internal state: a Map from notebookId to the list of run records for that
 * notebook. A new Map is produced on every update to preserve React
 * immutability invariants.
 */
type RunHistoryMap = Map<string, CellRunRecord[]>;

/**
 * Actions that may mutate the run-history store.
 */
type StoreAction = {
  type: 'RECORD_RUN';
  notebookId: string;
  cellId: string;
  succeeded: boolean;
  ranAt: number;
};

/**
 * Pure reducer for RunHistoryMap.
 *
 * RECORD_RUN: appends or replaces the record for cellId within notebookId.
 *
 * @param state  Current run history map
 * @param action Dispatched action
 * @returns      New map after the mutation
 */
function runHistoryReducer(state: RunHistoryMap, action: StoreAction): RunHistoryMap {
  switch (action.type) {
    case 'RECORD_RUN': {
      const existing = state.get(action.notebookId) ?? [];
      const updated: CellRunRecord[] = [
        ...existing.filter(r => r.cellId !== action.cellId),
        {cellId: action.cellId, ranAt: action.ranAt, succeeded: action.succeeded},
      ];
      const next = new Map(state);
      next.set(action.notebookId, updated);
      return next;
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * Shape of the value provided by CompletionContext.
 */
interface CompletionContextValue {
  /** Current run history, keyed by notebookId. */
  history: RunHistoryMap;
  /** Records a cell execution; replaces any previous record for that cellId. */
  recordRun: (notebookId: string, cellId: string, succeeded: boolean) => void;
}

/**
 * Context carrying run history and the recordRun mutator.
 * Null outside of a CompletionProvider subtree.
 */
const CompletionContext = createContext<CompletionContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Provides run-history tracking for all completion hooks in its subtree.
 * State is held in useReducer and discarded when the component unmounts.
 *
 * @param children React subtree
 */
export function CompletionProvider({children}: {children: React.ReactNode}): React.ReactElement {
  const [history, dispatch] = useReducer(runHistoryReducer, new Map<string, CellRunRecord[]>());

  /**
   * Records a single cell execution, adding or replacing the existing entry.
   * @param notebookId Notebook the cell belongs to
   * @param cellId     Stable cell UUID
   * @param succeeded  Whether the run ended without error
   */
  const recordRun = useCallback(
    (notebookId: string, cellId: string, succeeded: boolean): void => {
      dispatch({type: 'RECORD_RUN', notebookId, cellId, succeeded, ranAt: Date.now()});
    },
    []
  );

  return (
    <CompletionContext.Provider value={{history, recordRun}}>
      {children}
    </CompletionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hooks
// ---------------------------------------------------------------------------

/**
 * Returns the raw CompletionContextValue.
 * Throws when called outside a CompletionProvider.
 *
 * @returns CompletionContextValue
 */
function useCompletionContext(): CompletionContextValue {
  const ctx = useContext(CompletionContext);
  if (ctx === null) {
    throw new Error('useCompletionContext must be called inside CompletionProvider');
  }
  return ctx;
}

/**
 * Derives and returns the CompletionState for a notebook, using the in-memory
 * run records and the caller-supplied list of runnable cell IDs.
 *
 * Returns null when there are no run records at all for the notebook and
 * runnableCellIds is empty (nothing to complete).
 *
 * @param notebookId      Stable notebook identifier
 * @param runnableCellIds IDs of code cells with non-empty source
 * @returns               Derived CompletionState, or null when not yet tracked
 */
export function useCompletion(
  notebookId: string,
  runnableCellIds: string[]
): CompletionState | null {
  const {history} = useCompletionContext();
  const records = history.get(notebookId) ?? [];

  if (records.length === 0 && runnableCellIds.length === 0) return null;

  const ranCellIdSet = new Set(records.map(r => r.cellId));
  const ranCellIds = runnableCellIds.filter(id => ranCellIdSet.has(id));

  const isComplete =
    runnableCellIds.length > 0 &&
    ranCellIds.length >= runnableCellIds.length;

  let completedAt: number | null = null;
  if (isComplete) {
    const maxRanAt = records.reduce<number | null>((max, r) => {
      if (max === null) return r.ranAt;
      return r.ranAt > max ? r.ranAt : max;
    }, null);
    completedAt = maxRanAt ?? Date.now();
  }

  return {notebookId, runnableCellIds, ranCellIds, isComplete, completedAt};
}

/**
 * Returns a stable callback that records a cell execution in the completion
 * store. The callback signature is `(notebookId, cellId, succeeded) => void`.
 *
 * @returns Stable recordRun callback
 */
export function useRecordRun(): (
  notebookId: string,
  cellId: string,
  succeeded: boolean
) => void {
  return useCompletionContext().recordRun;
}
