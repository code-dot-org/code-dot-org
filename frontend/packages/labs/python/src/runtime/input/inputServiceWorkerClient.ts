import {
  AWAITING_INPUT,
  INPUT_SERVICE_WORKER_URL,
  SENDING_INPUT,
} from './constants';

// The window (iframe) side of blocking input: registers the input service
// worker, waits until it actually controls this client, and relays messages
// between it and the pyodide worker's XHR. Adapted from
// apps/src/pythonlab/sandbox/pyodideSandboxHelpers.ts.

/** Details of a program blocked awaiting input, as reported by the worker. */
export interface AwaitingInput {
  id: string;
  prompt: string;
}

/**
 * Register the input service worker and resolve once it controls this page — the
 * pyodide worker must be created *after* this, so it is a client the service
 * worker intercepts. `onAwaitingInput` fires each time a program blocks on input.
 *
 * Resolves `false` (rather than throwing) when service workers are unavailable or
 * registration fails, so the caller can still run programs without input.
 */
export async function initializeInputServiceWorker(
  onAwaitingInput: (awaiting: AwaitingInput) => void,
): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    await navigator.serviceWorker.register(INPUT_SERVICE_WORKER_URL);
  } catch (error) {
    console.error('Failed to register input service worker', error);
    return false;
  }

  await navigator.serviceWorker.ready;
  // `ready` guarantees an active worker, not that it controls us yet; the worker
  // calls clients.claim() on activate, so wait for control before returning.
  if (!navigator.serviceWorker.controller) {
    await new Promise<void>(resolve => {
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => resolve(),
        {once: true},
      );
    });
  }

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === AWAITING_INPUT) {
      onAwaitingInput({id: event.data.id, prompt: event.data.prompt});
    }
  });

  return true;
}

/** Forward a line of user input to the service worker, unblocking the program. */
export function sendInputToServiceWorker(value: string, id: string) {
  navigator.serviceWorker.controller?.postMessage({
    type: SENDING_INPUT,
    value,
    id,
  });
}
