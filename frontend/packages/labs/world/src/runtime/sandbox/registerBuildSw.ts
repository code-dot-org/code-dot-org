// Registers the build transport service worker
// (public/sandbox/worldBuildServiceWorker.js) on the sandbox origin. Mirrors
// web-lab's previewPage registration: never let the HTTP cache answer for the
// worker script, and — for the preview surface — wait until the worker actually
// CONTROLS this client, so its module `import()` is intercepted and served from
// memory.
//
// Everything here is about OUR worker specifically, never "whatever worker is
// around". An origin can hold several registrations at different scopes, and
// `navigator.serviceWorker.controller` names whichever one currently controls
// this page — which, in the seconds before ours claims it, can be a broader one
// that knows nothing about builds. Posting a bundle to that worker is silent:
// it ignores the message, and the compile waits for a confirmation that will
// never come. That is what the lab's own mock-API worker did to the demo when
// the two shared an origin (see SANDBOX_SURFACE_DIR).

/**
 * Relative to the surface that registers it, which is what scopes it to the
 * sandbox directory rather than to the whole origin (`SANDBOX_SURFACE_DIR`).
 * A worker's default scope is the directory of its script, and a client is
 * controlled by the most specific scope matching it — so when the lab shares
 * this origin, its worker at the base above keeps the lab and this one keeps
 * the two surfaces. Both hold a registration; neither evicts the other.
 */
const SW_URL = './worldBuildServiceWorker.js';

/** Whether `worker` is the one this module registered. */
const isOurs = (worker: ServiceWorker | null | undefined): boolean =>
  worker?.scriptURL === new URL(SW_URL, window.location.href).href;

/** This registration's own worker, once it has activated. */
function activated(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorker | null> {
  if (registration.active) {
    return Promise.resolve(registration.active);
  }
  const pending = registration.installing ?? registration.waiting;
  if (!pending) {
    return Promise.resolve(null);
  }
  return new Promise(resolve => {
    pending.addEventListener('statechange', () => {
      if (pending.state === 'activated') {
        resolve(pending);
      }
    });
  });
}

/**
 * Wait until OUR worker controls this page — not merely until some worker does.
 * `clients.claim()` is async, so a page can load uncontrolled, or controlled by
 * a broader-scoped registration that ours has not yet displaced.
 */
function controlledByOurs(): Promise<void> {
  if (isOurs(navigator.serviceWorker.controller)) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    const check = () => {
      if (isOurs(navigator.serviceWorker.controller)) {
        navigator.serviceWorker.removeEventListener('controllerchange', check);
        resolve();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', check);
  });
}

export async function registerBuildSw({
  awaitControl,
}: {
  awaitControl: boolean;
}): Promise<ServiceWorker | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register(SW_URL, {
      updateViaCache: 'none',
    });
    registration.update().catch(() => {
      // Best-effort; the existing worker still serves.
    });
    const worker = await activated(registration);
    if (awaitControl) {
      await controlledByOurs();
    }
    return worker;
  } catch {
    return null;
  }
}
