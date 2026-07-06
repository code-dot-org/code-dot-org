import {AWAITING_INPUT, SENDING_INPUT} from '../pythonHelpers/constants';

import {
  FromPyodideSandboxMessage,
  PyodideSandboxAwaitingInputMessage,
} from './constants';

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

export const outerOrigin = getOuterOrigin();

let inputServiceWorker: ServiceWorker | undefined;
let setupPromise: Promise<void> | undefined;

const canSupportInput = () => {
  return 'serviceWorker' in navigator;
};

const registerServiceWorker = async () => {
  if (!canSupportInput()) {
    window.parent.postMessage(
      {type: FromPyodideSandboxMessage.SERVICE_WORKER_UNAVAILABLE},
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
      {type: FromPyodideSandboxMessage.SERVICE_WORKER_UNAVAILABLE},
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
        type: FromPyodideSandboxMessage.AWAITING_INPUT,
        id: event.data.id,
      };
      window.parent.postMessage(message, outerOrigin);
    }
  };
};

export const initializeServiceWorker = async () => {
  if (!setupPromise) {
    setupPromise = registerServiceWorker();
  }
  await setupPromise;
};

export const sendToInputServiceWorker = (value: string, id: string) => {
  if (!inputServiceWorker) {
    console.error('No service worker registered');
    return;
  }
  inputServiceWorker.postMessage({type: SENDING_INPUT, value, id});
};
