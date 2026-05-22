/**
 * React context + reducer for Pyodide runtime state.
 *
 * Owns execution status per cell, worker lifecycle, and the interrupt buffer
 * ref.  PyodideProvider populates this by dispatching actions in response to
 * worker messages; cells read from it via the selector hooks below.
 *
 * Map values are copied on every mutation (new Map(...)) to preserve React
 * immutability invariants while keeping O(1) cell lookups.
 */

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Execution lifecycle state for a single cell.
 *
 * Transitions: idle → queued → running → ran-ok | ran-error → idle
 */
export type CellRunState =
  | 'idle'
  | 'queued'
  | 'running'
  | 'ran-ok'
  | 'ran-error';

/**
 * All output produced by a single cell execution, plus its run state.
 *
 * `results` accumulates MIME-keyed dicts from `execute_result` messages;
 * multiple may arrive per run (e.g. matplotlib then __repr__).
 * `ranAt` is the Unix-ms timestamp recorded on EXECUTION_COMPLETED.
 */
export interface CellOutput {
  /** Accumulated stdout text from `stdout` worker messages. */
  stdout: string;
  /** MIME-keyed result dicts accumulated over one run. */
  results: Array<Record<string, unknown>>;
  /** Full Python traceback on error, or null when clean. */
  error: string | null;
  /** Lifecycle state of this cell's execution. */
  state: CellRunState;
  /** Unix-ms timestamp when the last run completed, or null if never run. */
  ranAt: number | null;
}

/**
 * Lifecycle state of the Pyodide Web Worker.
 *
 * uninitialized → initializing → ready → running → ready (cycle)
 * Any state → resetting → ready
 * Any state → fatal (terminal; user must reload)
 */
export type WorkerStatus =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'running'
  | 'resetting'
  | 'fatal';

/**
 * Full runtime state managed by this store.
 */
export interface RuntimeState {
  /** Current worker lifecycle status. */
  workerStatus: WorkerStatus;
  /** ID of the cell currently executing in the worker, or null. */
  runningCellId: string | null;
  /**
   * Int32Array view over the SharedArrayBuffer used to signal interrupts.
   * Null when SharedArrayBuffer is unavailable (cross-origin isolation missing).
   */
  interruptBuffer: Int32Array | null;
  /** Whether interrupt-via-SharedArrayBuffer is available. */
  hasInterrupt: boolean;
  /** Pyodide version string, populated on `initialized` message. */
  pyodideVersion: string;
  /** Per-cell output keyed by cell ID. */
  cells: Map<string, CellOutput>;
  /** Fatal error string, set on `fatal` worker message. */
  fatalError: string | null;
  /**
   * Prompt string when Python's input() is awaiting user response.
   * Null when no input is pending.
   */
  pendingInputMessage: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all actions that can mutate RuntimeState.
 */
export type RuntimeAction =
  | { type: 'SET_WORKER_STATUS'; status: WorkerStatus }
  | { type: 'SET_INTERRUPT_BUFFER'; buffer: Int32Array; hasInterrupt: boolean }
  | { type: 'SET_PYODIDE_VERSION'; version: string }
  | { type: 'SET_CELL_STATE'; cellId: string; state: CellRunState }
  | { type: 'ADD_STDOUT'; cellId: string; text: string }
  | { type: 'SET_RESULT'; cellId: string; result: Record<string, unknown> }
  | { type: 'SET_ERROR'; cellId: string; error: string }
  | { type: 'SET_RUNNING_CELL'; cellId: string }
  | { type: 'EXECUTION_COMPLETED'; cellId: string }
  | { type: 'RESET_COMPLETED' }
  | { type: 'SET_FATAL_ERROR'; error: string }
  | { type: 'REQUEST_INPUT'; message: string }
  | { type: 'CLEAR_INPUT' };

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/**
 * Default output state for a cell that has never been run.
 * Exported so consumers can substitute it when a cell ID is absent from
 * the cells Map without needing to construct the object themselves.
 */
export const defaultCellOutput: CellOutput = {
  stdout: '',
  results: [],
  error: null,
  state: 'idle',
  ranAt: null,
};

/**
 * Initial RuntimeState — all fields empty or inert.
 */
export const initialRuntimeState: RuntimeState = {
  workerStatus: 'uninitialized',
  runningCellId: null,
  interruptBuffer: null,
  hasInterrupt: false,
  pyodideVersion: '',
  cells: new Map(),
  fatalError: null,
  pendingInputMessage: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the existing CellOutput for cellId, or defaultCellOutput if absent.
 * Does NOT insert a default entry into the Map.
 * @param cells Current cells map
 * @param cellId Target cell ID
 * @returns CellOutput for that cell
 */
function getCell(
  cells: Map<string, CellOutput>,
  cellId: string
): CellOutput {
  return cells.get(cellId) ?? { ...defaultCellOutput };
}

/**
 * Returns a new Map identical to `cells` but with `cellId` mapped to
 * a shallow-merged update of the current entry.
 * @param cells Current cells map
 * @param cellId Target cell ID
 * @param patch Partial CellOutput to merge in
 * @returns New Map with the patch applied
 */
function patchCell(
  cells: Map<string, CellOutput>,
  cellId: string,
  patch: Partial<CellOutput>
): Map<string, CellOutput> {
  const updated = new Map(cells);
  updated.set(cellId, { ...getCell(cells, cellId), ...patch });
  return updated;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure reducer for RuntimeState.
 * @param state Current runtime state
 * @param action Dispatched action
 * @returns Next runtime state
 */
export function runtimeReducer(
  state: RuntimeState,
  action: RuntimeAction
): RuntimeState {
  switch (action.type) {
    case 'SET_WORKER_STATUS':
      return { ...state, workerStatus: action.status };

    case 'SET_INTERRUPT_BUFFER':
      return {
        ...state,
        interruptBuffer: action.buffer,
        hasInterrupt: action.hasInterrupt,
      };

    case 'SET_PYODIDE_VERSION':
      return { ...state, pyodideVersion: action.version };

    case 'SET_CELL_STATE':
      return {
        ...state,
        cells: patchCell(state.cells, action.cellId, { state: action.state }),
      };

    case 'ADD_STDOUT': {
      const prev = getCell(state.cells, action.cellId);
      return {
        ...state,
        cells: patchCell(state.cells, action.cellId, {
          stdout: prev.stdout + action.text,
        }),
      };
    }

    case 'SET_RESULT': {
      const prev = getCell(state.cells, action.cellId);
      return {
        ...state,
        cells: patchCell(state.cells, action.cellId, {
          results: [...prev.results, action.result],
        }),
      };
    }

    case 'SET_ERROR':
      return {
        ...state,
        cells: patchCell(state.cells, action.cellId, {
          error: action.error,
          state: 'ran-error',
        }),
      };

    case 'SET_RUNNING_CELL':
      return {
        ...state,
        runningCellId: action.cellId,
        workerStatus: 'running',
        // Clear previous output for this cell when a new run starts.
        cells: patchCell(state.cells, action.cellId, {
          stdout: '',
          results: [],
          error: null,
          state: 'running',
          ranAt: null,
        }),
      };

    case 'EXECUTION_COMPLETED': {
      const didError =
        getCell(state.cells, action.cellId).state === 'ran-error';
      return {
        ...state,
        workerStatus: 'ready',
        runningCellId: null,
        cells: patchCell(state.cells, action.cellId, {
          state: didError ? 'ran-error' : 'ran-ok',
          ranAt: Date.now(),
        }),
      };
    }

    case 'RESET_COMPLETED':
      return { ...state, workerStatus: 'ready' };

    case 'SET_FATAL_ERROR':
      return {
        ...state,
        workerStatus: 'fatal',
        fatalError: action.error,
      };

    case 'REQUEST_INPUT':
      return { ...state, pendingInputMessage: action.message };

    case 'CLEAR_INPUT':
      return { ...state, pendingInputMessage: null };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * Shape of the value provided by RuntimeContext.
 *
 * runCell / stopCell / resetGlobals / respondToInput are supplied by
 * PyodideProvider; they call the worker directly rather than going through the
 * reducer, to avoid an extra render cycle between dispatch and postMessage.
 */
export interface RuntimeContextValue {
  /** Current runtime state. */
  state: RuntimeState;
  /** Dispatch a RuntimeAction to the reducer. */
  dispatch: Dispatch<RuntimeAction>;
  /**
   * Queue and execute a cell.  Dispatches state changes then posts `run` to the
   * worker immediately; no queued-state watcher needed.
   * @param cellId Stable cell ID
   * @param code Substituted source code ready for the worker
   */
  runCell: (cellId: string, code: string) => void;
  /** Stop the running cell; uses interrupt buffer when available or respawns. */
  stopCell: () => void;
  /** Post `reset` to the worker, clearing user-defined Python globals. */
  resetGlobals: () => void;
  /**
   * Post `input_response` to the worker.
   * @param value The user's input string, or null to inject KeyboardInterrupt.
   */
  respondToInput: (value: string | null) => void;
}

/**
 * Context carrying runtime state plus imperative worker callbacks.
 * Null outside of a RuntimeProvider/PyodideProvider subtree.
 */
export const RuntimeContext = createContext<RuntimeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider (state shell only; PyodideProvider wraps this)
// ---------------------------------------------------------------------------

/**
 * Provides RuntimeState + dispatch via RuntimeContext using useReducer.
 * Does not own the worker; PyodideProvider overlays the imperative callbacks.
 * Exported separately so tests can provide a stubbed context without a worker.
 * @param children React subtree
 */
// eslint-disable-next-line react-refresh/only-export-components
export function RuntimeProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [state, dispatch] = useReducer(runtimeReducer, initialRuntimeState);

  // Placeholder callbacks — overwritten by PyodideProvider's context value.
  // These throw to make misconfiguration obvious; PyodideProvider always
  // provides real implementations before any child can call them.
  const runCell = (_cellId: string, _code: string): void => {
    throw new Error('runCell called outside PyodideProvider');
  };
  const stopCell = (): void => {
    throw new Error('stopCell called outside PyodideProvider');
  };
  const resetGlobals = (): void => {
    throw new Error('resetGlobals called outside PyodideProvider');
  };
  const respondToInput = (_value: string | null): void => {
    throw new Error('respondToInput called outside PyodideProvider');
  };

  return (
    <RuntimeContext.Provider
      value={{ state, dispatch, runCell, stopCell, resetGlobals, respondToInput }}
    >
      {children}
    </RuntimeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hooks
// ---------------------------------------------------------------------------

/**
 * Returns the full RuntimeContextValue.  Throws if called outside
 * RuntimeProvider / PyodideProvider.
 * @returns RuntimeContextValue
 */
export function useRuntime(): RuntimeContextValue {
  const ctx = useContext(RuntimeContext);
  if (ctx === null) {
    throw new Error('useRuntime must be called inside PyodideProvider');
  }
  return ctx;
}

/**
 * Returns the current RuntimeState.
 * @returns RuntimeState
 */
export function useRuntimeState(): RuntimeState {
  return useRuntime().state;
}

/**
 * Returns the current WorkerStatus.
 * @returns WorkerStatus
 */
export function useWorkerStatus(): WorkerStatus {
  return useRuntimeState().workerStatus;
}

/**
 * Returns the CellOutput for the given cell ID.
 * Falls back to defaultCellOutput when the cell has never been run.
 * @param cellId Target cell ID
 * @returns CellOutput
 */
export function useCellOutput(cellId: string): CellOutput {
  const { cells } = useRuntimeState();
  return cells.get(cellId) ?? defaultCellOutput;
}

/**
 * Returns the stable `runCell` callback from the nearest PyodideProvider.
 * @returns (cellId: string, code: string) => void
 */
export function useRunCell(): (cellId: string, code: string) => void {
  return useRuntime().runCell;
}

/**
 * Returns the stable `stopCell` callback.
 * @returns () => void
 */
export function useStopCell(): () => void {
  return useRuntime().stopCell;
}

/**
 * Returns the stable `resetGlobals` callback.
 * @returns () => void
 */
export function useResetGlobals(): () => void {
  return useRuntime().resetGlobals;
}

/**
 * Returns the stable `respondToInput` callback.
 * @returns (value: string | null) => void
 */
export function useRespondToInput(): (value: string | null) => void {
  return useRuntime().respondToInput;
}
