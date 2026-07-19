import type {PyodideMessage} from '../messages';

import {
  FromSandboxMessage,
  PARENT_ORIGIN_PARAM,
  type SandboxRunMessage,
  type ToSandbox,
  ToSandboxMessage,
} from './messages';

// The sandbox backend (iframe side). Runs inside the hidden iframe on a separate
// origin (see sandbox.html), isolated from the host page's cookies and session.
// It owns the actual pyodide worker and does nothing but relay: run/stop requests
// down from the parent to the worker, and the worker's output back up. All
// console/Redux/business logic lives in the parent (pyodideSandboxManager); this
// side is deliberately dumb. See README "Domain sandbox".

// The parent tells us its origin via a query param on our URL. We trust messages
// only from it, and post our results only to it.
const parentOrigin = new URLSearchParams(window.location.search).get(
  PARENT_ORIGIN_PARAM,
);

function createWorker(): Worker {
  const worker = new Worker(
    new URL('../pyodideWebWorker.ts', import.meta.url),
    {
      type: 'module',
    },
  );
  // Relay every worker message straight up to the parent.
  worker.onmessage = (event: MessageEvent<PyodideMessage>) => {
    if (parentOrigin) {
      window.parent.postMessage(event.data, parentOrigin);
    }
  };
  return worker;
}

let worker = createWorker();

window.addEventListener('message', event => {
  // The parent page is the only origin we ever trust messages from.
  if (!parentOrigin || event.origin !== parentOrigin) {
    return;
  }
  const data = event.data as ToSandbox;
  switch (data?.type) {
    case ToSandboxMessage.RUN: {
      const {id, python, files} = data as SandboxRunMessage;
      worker.postMessage({id, python, files});
      break;
    }
    case ToSandboxMessage.RESTART_WORKER:
      worker.terminate();
      worker = createWorker();
      break;
    default:
      break;
  }
});

// The worker was created above (pyodide is already loading); tell the parent we
// can accept run requests.
if (parentOrigin) {
  window.parent.postMessage({type: FromSandboxMessage.READY}, parentOrigin);
}
