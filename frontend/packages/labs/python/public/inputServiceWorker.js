/**
 * Service worker that makes blocking Python `input()` work. It intercepts the
 * synchronous XHR the pyodide worker makes to /pythonlab-input-sw/, asks the
 * window for a line of input, and holds the response open until the window sends
 * one back — which unblocks the worker's XHR.
 *
 * Needed because the pyodide worker is single-threaded: it cannot both await the
 * running program and service the program's own input requests.
 *
 * Ported ~verbatim from apps/src/pythonlab/inputServiceWorker.js. A service
 * worker cannot import modules, so these constants are duplicated from
 * src/runtime/input/constants.ts — keep them in sync.
 */
const AWAITING_INPUT = 'AWAITING_INPUT';
const SENDING_INPUT = 'SENDING_INPUT';
const SERVICE_WORKER_PATH = '/pythonlab-input-sw/';

addEventListener('install', () => {
  // Activate immediately rather than waiting for existing clients to close.
  self.skipWaiting();
});

addEventListener('activate', event => {
  // Take control of the iframe (and its pyodide worker) right away, so their
  // fetches route through this service worker.
  event.waitUntil(self.clients.claim());
});

// Pending input requests, keyed by run id: the resolver of each intercepted
// fetch's response promise.
const resolvers = new Map();

addEventListener('message', event => {
  // The window is sending us the user's input for a pending request.
  if (event.data.type === SENDING_INPUT) {
    const resolverArray = resolvers.get(event.data.id);
    if (!resolverArray || resolverArray.length === 0) {
      console.error('Error handling input: no pending request');
      return;
    }
    const resolver = resolverArray.shift();
    resolver(new Response(event.data.value, {status: 200}));
  }
});

addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname !== SERVICE_WORKER_PATH) {
    return;
  }

  const id = url.searchParams.get('id');
  const prompt = url.searchParams.get('prompt');

  // Tell every window client we are awaiting input for this run.
  event.waitUntil(
    self.clients.matchAll({includeUncontrolled: true}).then(clients => {
      clients.forEach(client => {
        if (client.type === 'window') {
          client.postMessage({type: AWAITING_INPUT, id, prompt});
        }
      });
    }),
  );

  // Hold the response open; the `message` handler above resolves it once input
  // arrives. Multiple requests for the same id queue in order.
  const promise = new Promise(resolve =>
    resolvers.set(id, [...(resolvers.get(id) || []), resolve]),
  );
  event.respondWith(promise);
});
