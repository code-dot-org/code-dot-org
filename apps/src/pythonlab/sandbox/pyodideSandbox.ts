import {AWAITING_INPUT, SENDING_INPUT} from '../pythonHelpers/constants';

import {
  PyodideSandboxAwaitingInputMessage,
  PyodideSandboxMessageType,
  PyodideSandboxRunMessage,
  PyodideSandboxSendingInputMessage,
} from './constants';

// Runs the pyodide web worker (and the input service worker it depends on) inside a
// hidden iframe served from a dedicated codeprojects.org subdomain, isolated from
// studio.code.org's cookies/session. Owned and messaged by
// apps/src/pythonlab/pyodideWorkerManager.ts. See apps/src/pythonlab/README.md for the
// full architecture and the postMessage contract in ./constants.ts.

let inputServiceWorker: ServiceWorker | undefined;
let setupPromise: Promise<void> | undefined;

// Mirrors apps/src/weblab2/htmlPreview/InnerHTMLPreview.tsx's computation of its own
// parent origin, since this sandbox is served from the same preview.codeprojects.org
// subdomain family.
const getOuterOrigin = () => {
  const regex = /[^.]+\.preview\.([^.]+)\.codeprojects\.org/;
  const match = location.hostname.match(regex);
  const environment = match && match[1] ? `${match[1]}-` : '';
  const port =
    'localhost-' === environment && location.port ? `:${location.port}` : '';
  const cdn = environment.includes('adhoc') ? 'cdn-' : '';
  return `${location.protocol}//${environment}studio.${cdn}code.org${port}`;
};

const outerOrigin = getOuterOrigin();

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

const canSupportInput = () => {
  return 'serviceWorker' in navigator;
};

const registerServiceWorker = async () => {
  if (!canSupportInput()) {
    window.parent.postMessage(
      {type: PyodideSandboxMessageType.SERVICE_WORKER_UNAVAILABLE},
      outerOrigin
    );
    return;
  }

  try {
    // Do not move the url into a variable, because webpack needs it to be passed as
    // a parameter to register() directly in order to set up inputServiceWorker as a service worker.
    // The service worker is versioned to ensure the correct version is loaded.
    // Update the version if you update the service worker.
    const registration = await navigator.serviceWorker.register(
      new URL(
        /* webpackChunkName: "input-service-worker-1.0.0" */
        '../inputServiceWorker.js',
        // @ts-expect-error because TypeScript does not like this syntax.
        import.meta.url
      )
    );

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            inputServiceWorker = installingWorker;
          }
        });
      }
    });
  } catch (error) {
    console.error(`Registration failed with ${error}`);
    // Log that we failed to register the service worker.
    window.parent.postMessage(
      {type: PyodideSandboxMessageType.SERVICE_WORKER_UNAVAILABLE},
      outerOrigin
    );
    return;
  }

  navigator.serviceWorker.onmessage = event => {
    if (event.data.type === AWAITING_INPUT) {
      if (event.source instanceof ServiceWorker) {
        // Update the service worker reference, in case the service worker is different to the one we registered
        inputServiceWorker = event.source;
      }
      const message: PyodideSandboxAwaitingInputMessage = {
        type: PyodideSandboxMessageType.AWAITING_INPUT,
        id: event.data.id,
      };
      window.parent.postMessage(message, outerOrigin);
    }
  };
};

const initializeServiceWorker = async () => {
  if (!setupPromise) {
    setupPromise = registerServiceWorker();
  }
  await setupPromise;
};

let pyodideWorker = setUpPyodideWorker();

window.addEventListener('message', event => {
  // pyodideWorkerManager.ts (studio.code.org) is the only origin we should ever trust
  // messages from.
  if (event.origin !== outerOrigin) {
    return;
  }

  switch (event.data?.type) {
    case PyodideSandboxMessageType.RUN: {
      const {python, id, source, validationFile} =
        event.data as PyodideSandboxRunMessage;
      pyodideWorker.postMessage({python, id, source, validationFile});
      break;
    }
    case PyodideSandboxMessageType.SENDING_INPUT: {
      const {value, id} = event.data as PyodideSandboxSendingInputMessage;
      if (!inputServiceWorker) {
        console.error('No service worker registered');
        break;
      }
      inputServiceWorker.postMessage({type: SENDING_INPUT, value, id});
      break;
    }
    case PyodideSandboxMessageType.RESTART_WORKER:
      pyodideWorker.terminate();
      pyodideWorker = setUpPyodideWorker();
      break;
    default:
      break;
  }
});

initializeServiceWorker().then(() => {
  window.parent.postMessage(
    {type: PyodideSandboxMessageType.SANDBOX_READY},
    outerOrigin
  );
});
