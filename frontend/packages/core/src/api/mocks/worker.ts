// MSW worker boot. The consumer (e.g. the studio app) calls
// `startMockWorker()` once at startup, *before* React mounts and before any
// import of `DashboardApiClient`. The handler list is the aggregate of all
// domain handlers; new domains plug in by extending `getMockHandlers()` in
// `./index.ts`.

import type {RequestHandler} from 'msw';
import type {SetupWorker, StartOptions} from 'msw/browser';

import {getMockHandlers} from './handlers';

let worker: SetupWorker | undefined;

/**
 * Start the MSW service worker with the registered handlers. Resolves once
 * the worker is active and intercepting. Safe to call more than once; later
 * calls are no-ops.
 */
export async function startMockWorker(
  options?: StartOptions,
  extraHandlers: RequestHandler[] = [],
): Promise<SetupWorker> {
  if (worker) return worker;

  // Dynamic import so msw stays out of any bundle that doesn't opt into mocks.
  const {setupWorker} = await import('msw/browser');
  worker = setupWorker(...getMockHandlers(), ...extraHandlers);

  await worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {url: '/mockServiceWorker.js'},
    ...options,
  });

  return worker;
}

/** Returns the running worker, or `undefined` if `startMockWorker` hasn't been called. */
export function getMockWorker(): SetupWorker | undefined {
  return worker;
}
