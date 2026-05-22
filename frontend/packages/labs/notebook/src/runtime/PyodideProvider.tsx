/**
 * Ported from jupyter-k12 (MIT, Simon Guest). Adapted for @code-dot-org/notebook-lab.
 *
 * Owns the Pyodide Web Worker lifecycle and bridges worker messages to
 * RuntimeContext.  Every component in the subtree can call useRunCell(),
 * useStopCell(), etc. without knowing the worker exists.
 *
 * Sits inside SessionProvider in the tree; it does not need to know about
 * sessions or notebooks — those concerns are upstream.
 */

import {
  useEffect,
  useReducer,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';

import {
  RuntimeContext,
  runtimeReducer,
  initialRuntimeState,
  type RuntimeState,
} from './runtimeStore';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for PyodideProvider. */
interface PyodideProviderProps {
  /** React subtree that may consume runtime context. */
  children: ReactNode;
  /**
   * Active locale string (e.g. 'en-US').  Reserved for future use by
   * PyodideProvider; consumers retrieve it from their own context.
   */
  locale?: string | null;
}

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

/**
 * Spawns a new PyodideWorker module worker and posts `initialize`.
 * @returns The newly created Worker instance.
 */
function spawnWorker(): Worker {
  const worker = new Worker(
    new URL('./PyodideWorker.ts', import.meta.url),
    { type: 'module' }
  );
  worker.postMessage({ type: 'initialize' });
  return worker;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Provides Pyodide runtime state and imperative callbacks to the subtree via
 * RuntimeContext.  Creates the worker on mount and terminates it on unmount.
 * Re-spawns the worker on `stopCell` when SharedArrayBuffer is unavailable.
 * @param props PyodideProviderProps
 */
// eslint-disable-next-line react-refresh/only-export-components
export function PyodideProvider({
  children,
}: PyodideProviderProps): React.ReactElement {
  const [state, dispatch] = useReducer(runtimeReducer, initialRuntimeState);

  // Stable ref so callbacks always hold the current worker without stale closures.
  const workerRef = useRef<Worker | null>(null);
  // Stable ref so callbacks always hold the current state without stale closures.
  const stateRef = useRef<RuntimeState>(state);
  stateRef.current = state;

  // ---------------------------------------------------------------------------
  // Worker message handler
  // ---------------------------------------------------------------------------

  /**
   * Routes incoming worker messages to dispatch actions.
   * Defined as a stable callback so it can be registered on worker.onmessage.
   */
  const handleMessage = useCallback(
    (event: MessageEvent): void => {
      const { type, ...data } = event.data as {
        type: string;
        [k: string]: unknown;
      };

      switch (type) {
        case 'initialized': {
          dispatch({ type: 'SET_WORKER_STATUS', status: 'ready' });
          dispatch({ type: 'SET_PYODIDE_VERSION', version: data.pyodideVersion as string });
          if (data.interruptBuffer !== null && data.interruptBuffer !== undefined) {
            dispatch({
              type: 'SET_INTERRUPT_BUFFER',
              buffer: new Int32Array(data.interruptBuffer as ArrayBuffer),
              hasInterrupt: data.hasInterrupt as boolean,
            });
          }
          break;
        }

        case 'stdout': {
          const runningId = stateRef.current.runningCellId;
          if (runningId !== null) {
            dispatch({ type: 'ADD_STDOUT', cellId: runningId, text: data.text as string });
          }
          break;
        }

        case 'input_request': {
          dispatch({ type: 'REQUEST_INPUT', message: data.message as string });
          break;
        }

        case 'execute_result': {
          const cellId =
            (data.cellId as string | undefined) ?? stateRef.current.runningCellId;
          if (cellId !== null && cellId !== undefined) {
            dispatch({
              type: 'SET_RESULT',
              cellId,
              result: data.result as Record<string, unknown>,
            });
          }
          break;
        }

        case 'execute_completed': {
          const cellId =
            (data.cellId as string | undefined) ?? stateRef.current.runningCellId;
          if (cellId !== null && cellId !== undefined) {
            dispatch({ type: 'EXECUTION_COMPLETED', cellId });
          }
          break;
        }

        case 'error': {
          const cellId =
            (data.cellId as string | undefined) ?? stateRef.current.runningCellId;
          if (cellId !== null && cellId !== undefined) {
            dispatch({ type: 'SET_ERROR', cellId, error: data.error as string });
            dispatch({ type: 'EXECUTION_COMPLETED', cellId });
          }
          break;
        }

        case 'reset_completed': {
          dispatch({ type: 'RESET_COMPLETED' });
          break;
        }

        case 'fatal': {
          dispatch({ type: 'SET_FATAL_ERROR', error: data.error as string });
          break;
        }

        default:
          console.warn(`PyodideProvider: unknown message type from worker: ${type}`);
          break;
      }
    },
    // dispatch is stable from useReducer; no other deps needed.
    [dispatch]
  );

  // ---------------------------------------------------------------------------
  // Worker lifecycle
  // ---------------------------------------------------------------------------

  useEffect(() => {
    console.log('PyodideProvider: Spawning worker');
    dispatch({ type: 'SET_WORKER_STATUS', status: 'initializing' });

    const worker = spawnWorker();
    worker.onmessage = handleMessage;
    workerRef.current = worker;

    return () => {
      console.log('PyodideProvider: Terminating worker');
      worker.terminate();
      workerRef.current = null;
    };
  }, [handleMessage]);

  // ---------------------------------------------------------------------------
  // Imperative callbacks provided to consumers
  // ---------------------------------------------------------------------------

  /**
   * Queues and immediately executes a cell.  Dispatches state changes then
   * posts `run` to the worker — no effect-watcher needed.
   * @param cellId Stable cell ID
   * @param code Substituted source code ready for the worker
   */
  const runCell = useCallback(
    (cellId: string, code: string): void => {
      dispatch({ type: 'SET_CELL_STATE', cellId, state: 'queued' });
      dispatch({ type: 'SET_RUNNING_CELL', cellId });
      workerRef.current?.postMessage({ type: 'run', cellId, code });
    },
    []
  );

  /**
   * Stops the running cell.  Uses the interrupt buffer when available;
   * otherwise terminates the worker and respawns it so the kernel is clean.
   */
  const stopCell = useCallback((): void => {
    const { interruptBuffer, hasInterrupt } = stateRef.current;

    if (hasInterrupt && interruptBuffer !== null) {
      // Signal Pyodide's interrupt check at the next safepoint.
      Atomics.store(interruptBuffer, 0, 2);
    } else {
      // No SharedArrayBuffer — terminate the stuck worker and boot a fresh one.
      console.log('PyodideProvider: Respawning worker (no interrupt support)');
      workerRef.current?.terminate();

      dispatch({ type: 'SET_WORKER_STATUS', status: 'initializing' });

      const worker = spawnWorker();
      worker.onmessage = handleMessage;
      workerRef.current = worker;
    }
  }, [handleMessage]);

  /**
   * Posts `reset` to the worker, clearing user-defined Python globals while
   * keeping the kernel alive.
   */
  const resetGlobals = useCallback((): void => {
    dispatch({ type: 'SET_WORKER_STATUS', status: 'resetting' });
    workerRef.current?.postMessage({ type: 'reset' });
  }, []);

  /**
   * Posts `input_response` to the worker after clearing the pending input flag.
   * Passing null injects a KeyboardInterrupt via the _pending_interrupt sentinel.
   * @param value The user's input string, or null to cancel.
   */
  const respondToInput = useCallback((value: string | null): void => {
    dispatch({ type: 'CLEAR_INPUT' });
    workerRef.current?.postMessage({ type: 'input_response', value });
  }, []);

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

  return (
    <RuntimeContext.Provider
      value={{ state, dispatch, runCell, stopCell, resetGlobals, respondToInput }}
    >
      {children}
    </RuntimeContext.Provider>
  );
}

export default PyodideProvider;
