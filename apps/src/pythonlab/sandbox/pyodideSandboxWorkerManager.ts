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

// Manages the actual pyodide web worker -- creating it, restarting it, and relaying
// its messages -- on behalf of pyodideSandboxManager.ts, which only manages the
// sandbox iframe itself and never touches the worker directly. Runs inside a hidden
// iframe served from a dedicated codeprojects.org subdomain, isolated from
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

  worker.onmessage = event => {
    window.parent.postMessage(event.data, outerOrigin);
  };

  return worker;
};

let pyodideWorker = setUpPyodideWorker();

window.addEventListener('message', event => {
  // pyodideSandboxManager.ts (studio.code.org) is the only origin we should ever trust
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
