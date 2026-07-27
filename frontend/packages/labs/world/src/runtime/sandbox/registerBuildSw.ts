// Registers the build transport service worker (public/worldBuildServiceWorker.js)
// on the sandbox origin. Mirrors web-lab's previewPage registration: never let
// the HTTP cache answer for the worker script, and — for the preview surface —
// wait until the worker actually CONTROLS this client, so its module `import()`
// is intercepted and served from memory.

const SW_URL = '/worldBuildServiceWorker.js';

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
    await navigator.serviceWorker.ready;
    if (awaitControl && !navigator.serviceWorker.controller) {
      // clients.claim() is async; wait for control before serving imports.
      await new Promise<void>(resolve =>
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => resolve(),
          {once: true},
        ),
      );
    }
    return navigator.serviceWorker.controller ?? registration.active;
  } catch {
    return null;
  }
}
