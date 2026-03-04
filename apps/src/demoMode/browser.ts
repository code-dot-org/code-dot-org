import {setupWorker} from 'msw/browser';

import {handlers} from './handlers';

const worker = setupWorker(...handlers);

export async function startMockServiceWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
  console.log('[Demo Mode] MSW worker started — API responses are mocked');
}
