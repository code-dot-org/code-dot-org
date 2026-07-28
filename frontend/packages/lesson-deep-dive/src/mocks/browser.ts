import {setupWorker} from 'msw/browser';

import {handlers} from './handlers';

export const worker = setupWorker(...handlers);

export async function startMockWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest(request, print) {
      // Static assets and Vite internals pass through silently.
      const url = new URL(request.url);
      if (url.pathname.startsWith('/media/') || url.pathname.startsWith('/@')) {
        return;
      }
      print.warning();
    },
  });
}
