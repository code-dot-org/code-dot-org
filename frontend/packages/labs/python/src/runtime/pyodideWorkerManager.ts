import type {MultiFileSource} from '@code-dot-org/core/api';

import type {PyodideMessage, WorkerRequest} from './messages';
import {getPyodideBaseUrl} from './pyodideConfig';
import {type PyodideRuntime, routeWorkerMessage} from './pyodideRuntime';

// The direct backend: runs the pyodide web worker on this page. This is today's
// default (studio's PYTHONLAB_SEPARATE_DOMAIN experiment off). For isolation on a
// separate origin, see sandbox/pyodideSandboxManager. Trimmed from
// apps/src/pythonlab/pyodideWorkerManager.ts — stdin input (service worker), the
// neighborhood mini-app, matplotlib images, and source write-back are deferred.

/**
 * Build a direct-worker runtime. Each instance owns one worker and its in-flight
 * run callbacks; the façade builds exactly one. The worker is created lazily on
 * first use (preload or run) so importing this module has no side effects and it
 * works where `Worker` is absent (e.g. jsdom tests).
 */
export function createWorkerRuntime(): PyodideRuntime {
  // Resolvers for in-flight runs, keyed by run id. A non-empty map means a
  // program is currently running (used by `restartWorkerIfRunning`).
  const callbacks: Record<string, () => void> = {};
  let worker: Worker | undefined;

  function createWorker(): Worker {
    const w = new Worker(new URL('./pyodideWebWorker.ts', import.meta.url), {
      type: 'module',
    });
    w.onmessage = (event: MessageEvent<PyodideMessage>) =>
      routeWorkerMessage(event.data, id => {
        callbacks[id]?.();
        delete callbacks[id];
      });
    // Tell the worker where to load pyodide + wheels from; this also starts the
    // load (preload). Sent synchronously so it precedes any run.
    const init: WorkerRequest = {
      type: 'init',
      pyodideBaseUrl: getPyodideBaseUrl(),
    };
    w.postMessage(init);
    return w;
  }

  function ensureWorker(): Worker {
    if (!worker) {
      worker = createWorker();
    }
    return worker;
  }

  return {
    preloadPyodide() {
      ensureWorker();
    },

    asyncRun(python: string, source: MultiFileSource): Promise<void> {
      const id = crypto.randomUUID();
      return new Promise<void>(resolve => {
        callbacks[id] = resolve;
        const request: WorkerRequest = {type: 'run', id, python, source};
        ensureWorker().postMessage(request);
      });
    },

    restartWorkerIfRunning() {
      if (worker && Object.keys(callbacks).length > 0) {
        worker.terminate();
        // Resolve any pending runs so their callers stop awaiting.
        Object.keys(callbacks).forEach(id => {
          callbacks[id]();
          delete callbacks[id];
        });
        worker = createWorker();
      }
    },

    // Blocking `input()` needs the input service worker controlling the worker's
    // origin, which collides with anything else owning that origin's scope (in
    // the demo, MSW). Input is therefore supported only on the sandbox path; here
    // a program that calls `input()` gets INPUT_FAILED. See the README.
    sendInput() {},
  };
}
