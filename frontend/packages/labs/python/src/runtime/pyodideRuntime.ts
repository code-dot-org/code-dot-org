import {CodebridgeRegistry} from '@code-dot-org/codebridge';
import store, {labSystemActions} from '@code-dot-org/lab/redux';

import type {PyodideMessage, WorkerFile} from './messages';

// Shared by both execution backends — the direct worker (pyodideWorkerManager)
// and the iframe sandbox (sandbox/pyodideSandboxManager). The façade
// (pyodideManager) picks one; the rest of Python Lab talks to this interface.

/** The execution backend Python Lab drives. */
export interface PyodideRuntime {
  /** Start loading pyodide ahead of the first run (e.g. at lab mount). */
  preloadPyodide(): void;
  /** Run a program; resolves when it completes. */
  asyncRun(python: string, files: WorkerFile[]): Promise<void>;
  /** Stop a running program by restarting the worker. No-op if idle. */
  restartWorkerIfRunning(): void;
}

/** Write one line to the Codebridge console, if it is mounted. */
export function writeConsole(message: string) {
  CodebridgeRegistry.getConsoleManager()?.writeConsoleMessage(message);
}

/**
 * Route one message emitted by pyodideWebWorker.ts to the console and the base
 * `labSystem` slice. Both backends share it: the direct manager wires a worker's
 * `onmessage` to it; the sandbox manager feeds it messages relayed up from the
 * iframe. `onRunComplete` is called with the finished run's id so the caller can
 * resolve the matching run promise.
 */
export function routeWorkerMessage(
  data: PyodideMessage,
  onRunComplete: (id: string) => void,
) {
  const {type, id, message} = data;
  switch (type) {
    case 'sysout':
    case 'syserr':
      writeConsole(message ?? '');
      break;
    case 'error':
      store.dispatch(labSystemActions.setHasError(true));
      writeConsole(message ?? '');
      break;
    case 'run_complete':
      writeConsole('');
      onRunComplete(id);
      break;
    case 'loading_pyodide':
      store.dispatch(labSystemActions.setLoadedCodeEnvironment(false));
      break;
    case 'loaded_pyodide':
      store.dispatch(labSystemActions.setLoadedCodeEnvironment(true));
      break;
    default:
      break;
  }
}
