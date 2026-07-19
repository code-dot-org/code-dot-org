import {CodebridgeRegistry} from '@code-dot-org/codebridge';
import store, {labSystemActions} from '@code-dot-org/lab/redux';

import type {PyodideMessage, RunRequest, WorkerFile} from './messages';

// Owns the pyodide web worker and routes its messages: program output to the
// Codebridge console, load/error state to the base `labSystem` slice. Trimmed
// from apps/src/pythonlab/pyodideWorkerManager.ts — stdin input (service worker),
// the neighborhood mini-app, matplotlib images, and source write-back are
// deferred.

// Resolvers for in-flight runs, keyed by run id. A non-empty map means the
// worker is currently running a program (used by `restart`).
const callbacks: Record<string, () => void> = {};

function writeConsole(message: string) {
  CodebridgeRegistry.getConsoleManager()?.writeConsoleMessage(message);
}

function createWorker(): Worker {
  const worker = new Worker(new URL('./pyodideWebWorker.ts', import.meta.url), {
    type: 'module',
  });

  worker.onmessage = (event: MessageEvent<PyodideMessage>) => {
    const {type, id, message} = event.data;
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
        callbacks[id]?.();
        delete callbacks[id];
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
  };

  return worker;
}

// Created lazily on first run so importing this module has no side effects (and
// works in environments without Worker, e.g. jsdom tests). pyodide then loads on
// the first Run; a later change could preload it when the lab mounts.
let worker: Worker | undefined;

function ensureWorker(): Worker {
  if (!worker) {
    worker = createWorker();
  }
  return worker;
}

/** Run a program in the worker; resolves when the run completes. */
export function asyncRun(python: string, files: WorkerFile[]): Promise<void> {
  const id = crypto.randomUUID();
  return new Promise<void>(resolve => {
    callbacks[id] = resolve;
    const request: RunRequest = {id, python, files};
    ensureWorker().postMessage(request);
  });
}

/**
 * Stop a running program by terminating and recreating the worker (pyodide has
 * no cooperative interrupt here). No-op if nothing is running.
 */
export function restartWorkerIfRunning() {
  if (worker && Object.keys(callbacks).length > 0) {
    worker.terminate();
    // Resolve any pending runs so their callers stop awaiting.
    Object.keys(callbacks).forEach(id => {
      callbacks[id]();
      delete callbacks[id];
    });
    worker = createWorker();
  }
}
