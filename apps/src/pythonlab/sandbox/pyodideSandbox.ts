import {
  FromPyodideSandboxMessage,
  PyodideSandboxRunMessage,
  PyodideSandboxSendingInputMessage,
  ToPyodideSandboxMessage,
} from './constants';
import {
  initializeServiceWorker,
  outerOrigin,
  sendToInputServiceWorker,
} from './pyodideSandboxHelpers';

// Creates the pyodide web worker and dispatches messages from
// pyodideWorkerManager.ts to it, relaying results back via postMessage. Runs inside a
// hidden iframe served from a dedicated codeprojects.org subdomain, isolated from
// studio.code.org's cookies/session. See apps/src/pythonlab/README.md for the full
// architecture and the postMessage contract in ./constants.ts.

const setUpPyodideWorker = () => {
  // The web worker is versioned to ensure the correct version is loaded.
  // Update the version if you update the web worker.
  const worker = new Worker(
    /* webpackChunkName: "pyodide-web-worker-1.0.0" */ new URL(
      '../pyodideWebWorker.ts',
      // @ts-expect-error because TypeScript does not like this syntax.
      import.meta.url
    )
  );

  // This sandbox has no Redux store, console, or metrics reporter of its own -- all
  // pyodideWebWorker.ts messages (sysout, syserr, run_complete, updated_source, etc.)
  // are relayed unchanged for pyodideWorkerManager.ts to handle.
  worker.onmessage = event => {
    window.parent.postMessage(event.data, outerOrigin);
  };

  return worker;
};

let pyodideWorker = setUpPyodideWorker();

window.addEventListener('message', event => {
  // pyodideWorkerManager.ts (studio.code.org) is the only origin we should ever trust
  // messages from.
  if (event.origin !== outerOrigin) {
    return;
  }

  switch (event.data?.type) {
    case ToPyodideSandboxMessage.RUN: {
      const {python, id, source, validationFile} =
        event.data as PyodideSandboxRunMessage;
      pyodideWorker.postMessage({python, id, source, validationFile});
      break;
    }
    case ToPyodideSandboxMessage.SENDING_INPUT: {
      const {value, id} = event.data as PyodideSandboxSendingInputMessage;
      sendToInputServiceWorker(value, id);
      break;
    }
    case ToPyodideSandboxMessage.RESTART_WEB_WORKER:
      pyodideWorker.terminate();
      pyodideWorker = setUpPyodideWorker();
      break;
    default:
      break;
  }
});

initializeServiceWorker().then(() => {
  window.parent.postMessage(
    {type: FromPyodideSandboxMessage.READY},
    outerOrigin
  );
});
