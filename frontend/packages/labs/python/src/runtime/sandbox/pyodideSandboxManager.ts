import type {MultiFileSource} from '@code-dot-org/core/api';

import type {PyodideMessage} from '../messages';
import {getPyodideBaseUrl} from '../pyodideConfig';
import {type PyodideRuntime, routeWorkerMessage} from '../pyodideRuntime';

import {
  FromSandboxMessage,
  PARENT_ORIGIN_PARAM,
  PYODIDE_BASE_PARAM,
  type SandboxRunMessage,
  type ToSandbox,
  ToSandboxMessage,
} from './messages';

// The sandbox backend (parent side, runs on the host origin). Loads the pyodide
// worker inside a hidden iframe served from a *separate* origin, so student
// Python never touches this page's cookies or session — the isolation goal
// studio's PYTHONLAB_SEPARATE_DOMAIN experiment meets with a fixed codeprojects
// subdomain. Here the host names the origin via the sandbox URL instead (see
// pyodideManager). This side owns console output and Redux; the iframe
// (sandbox/pyodideSandboxWorkerManager) owns the worker and only relays messages.

/**
 * Build a sandbox runtime pointed at `sandboxUrl` (the sandbox page's URL). The
 * hidden iframe — and therefore pyodide loading — starts immediately, so the
 * façade building this on preload (at lab mount) warms the environment.
 */
export function createSandboxRuntime(sandboxUrl: string): PyodideRuntime {
  // Resolvers for in-flight runs, keyed by id (see pyodideWorkerManager).
  const callbacks: Record<string, () => void> = {};
  // Id of the program currently blocked awaiting input, if any.
  let awaitingInputId = '';

  // Resolve the URL against this page, then split off the origin we trust for
  // messages from the exact src (with the parent-origin param) the iframe loads.
  const resolved = new URL(sandboxUrl, window.location.href);
  const sandboxOrigin = resolved.origin;
  resolved.searchParams.set(PARENT_ORIGIN_PARAM, window.location.origin);
  // Tell the sandbox where to load pyodide from. This is an origin-relative path,
  // so it resolves against the sandbox origin — which must serve the assets there.
  resolved.searchParams.set(PYODIDE_BASE_PARAM, getPyodideBaseUrl());

  const readyPromise = new Promise<void>(resolve => {
    window.addEventListener('message', event => {
      // The sandbox iframe is the only origin we ever trust messages from.
      if (event.origin !== sandboxOrigin) {
        return;
      }
      if (event.data?.type === FromSandboxMessage.READY) {
        resolve();
        return;
      }
      if (event.data?.type === FromSandboxMessage.AWAITING_INPUT) {
        // A program is blocked on input(); remember which run, so sendInput can
        // address it. The prompt itself arrives separately as tagged stdout.
        awaitingInputId = event.data.id;
        return;
      }
      // Everything else is a pyodideWebWorker message relayed up by the iframe.
      routeWorkerMessage(event.data as PyodideMessage, id => {
        callbacks[id]?.();
        delete callbacks[id];
      });
    });
  });

  const iframe = document.createElement('iframe');
  iframe.title = 'Python sandbox';
  iframe.style.display = 'none';
  iframe.src = resolved.toString();
  document.body.appendChild(iframe);

  function post(message: ToSandbox) {
    iframe.contentWindow?.postMessage(message, sandboxOrigin);
  }

  return {
    preloadPyodide() {
      // The iframe (and its worker) already started when this runtime was built.
    },

    async asyncRun(python: string, source: MultiFileSource): Promise<void> {
      // Wait until the iframe has loaded and posted READY before sending a run.
      await readyPromise;
      const id = crypto.randomUUID();
      return new Promise<void>(resolve => {
        callbacks[id] = resolve;
        const message: SandboxRunMessage = {
          type: ToSandboxMessage.RUN,
          id,
          python,
          source,
        };
        post(message);
      });
    },

    restartWorkerIfRunning() {
      if (Object.keys(callbacks).length > 0) {
        // Resolve pending runs so their callers stop awaiting, then ask the
        // iframe to terminate and recreate the worker.
        Object.keys(callbacks).forEach(id => {
          callbacks[id]();
          delete callbacks[id];
        });
        awaitingInputId = '';
        post({type: ToSandboxMessage.RESTART_WORKER});
      }
    },

    sendInput(value: string) {
      // Ignore stray input when nothing is waiting for it.
      if (!awaitingInputId) {
        return;
      }
      post({
        type: ToSandboxMessage.SENDING_INPUT,
        id: awaitingInputId,
        value,
      });
      awaitingInputId = '';
    },
  };
}
