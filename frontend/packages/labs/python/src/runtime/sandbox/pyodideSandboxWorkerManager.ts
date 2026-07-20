import {version} from 'pyodide';

import {
  initializeInputServiceWorker,
  sendInputToServiceWorker,
} from '../input/inputServiceWorkerClient';
import type {PyodideMessage, WorkerRequest} from '../messages';

import {
  FromSandboxMessage,
  PARENT_ORIGIN_PARAM,
  PYODIDE_BASE_PARAM,
  type SandboxRunMessage,
  type SandboxSendingInputMessage,
  type ToSandbox,
  ToSandboxMessage,
} from './messages';

// The sandbox backend (iframe side). Runs inside the hidden iframe on a separate
// origin (see sandbox.html), isolated from the host page's cookies and session.
// It owns the actual pyodide worker and the input service worker, and does
// nothing but relay: run/stop/input requests down from the parent to the worker,
// and worker output and input requests back up. All console/Redux/business logic
// lives in the parent (pyodideSandboxManager). See README "Domain sandbox".

// The parent tells us its origin via a query param on our URL. We trust messages
// only from it, and post our results only to it.
const parentOrigin = new URLSearchParams(window.location.search).get(
  PARENT_ORIGIN_PARAM,
);

// Where to load pyodide + wheels from, named by the parent (see PYODIDE_BASE_PARAM
// in messages.ts). Resolves against this sandbox origin. Falls back to studio's
// default path if the parent did not name one.
const pyodideBaseUrl =
  new URLSearchParams(window.location.search).get(PYODIDE_BASE_PARAM) ||
  `/blockly/js/pyodide/${version}/`;

function postToParent(message: unknown) {
  if (parentOrigin) {
    window.parent.postMessage(message, parentOrigin);
  }
}

function createWorker(): Worker {
  const worker = new Worker(
    new URL('../pyodideWebWorker.ts', import.meta.url),
    {
      type: 'module',
    },
  );
  // Relay every worker message straight up to the parent.
  worker.onmessage = (event: MessageEvent<PyodideMessage>) =>
    postToParent(event.data);
  // Start the worker's load from this (sandbox) origin's hosted pyodide
  // directory (named by the parent; see pyodideBaseUrl above).
  const init: WorkerRequest = {type: 'init', pyodideBaseUrl};
  worker.postMessage(init);
  return worker;
}

let worker: Worker | undefined;

window.addEventListener('message', event => {
  // The parent page is the only origin we ever trust messages from.
  if (!parentOrigin || event.origin !== parentOrigin) {
    return;
  }
  const data = event.data as ToSandbox;
  switch (data?.type) {
    case ToSandboxMessage.RUN: {
      const {id, python, source} = data as SandboxRunMessage;
      const request: WorkerRequest = {type: 'run', id, python, source};
      worker?.postMessage(request);
      break;
    }
    case ToSandboxMessage.RESTART_WORKER:
      worker?.terminate();
      worker = createWorker();
      break;
    case ToSandboxMessage.SENDING_INPUT: {
      const {id, value} = data as SandboxSendingInputMessage;
      sendInputToServiceWorker(value, id);
      break;
    }
    default:
      break;
  }
});

// Register the input service worker first, then create the pyodide worker so it
// is a client the service worker controls (its blocking input XHR is intercepted
// only then). Registration failing is non-fatal — programs still run, without
// input support. Only once the worker exists do we tell the parent we are READY.
initializeInputServiceWorker(awaiting =>
  postToParent({type: FromSandboxMessage.AWAITING_INPUT, id: awaiting.id}),
).then(() => {
  worker = createWorker();
  postToParent({type: FromSandboxMessage.READY});
});
