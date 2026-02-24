/**
 * Service worker that manages input to Python programs. The service worker listens
 * for get requests to /pythonlab-input-sw/ and sends a message to all window clients
 * to prompt the user for input. The service worker then waits for a response from the
 * window client and responds to the get request with the user's input.
 *
 * We need to use a service worker for this because the pyodide web worker is single threaded, and cannot
 * both await the end of the user's program and also intercept input requests from the program.
 */
// These constants are duplicated in pythonHelpers/constants.ts. Service workers cannot import modules.
const AWAITING_INPUT = 'AWAITING_INPUT';
const SENDING_INPUT = 'SENDING_INPUT';
const SERVICE_WORKER_PATH = '/pythonlab-input-sw/';

addEventListener('install', () => {
  // Ensure this service worker is activated immediately.
  self.skipWaiting();
});

addEventListener('activate', event => {
  // Claim clients from any old service workers on this path.
  event.waitUntil(self.clients.claim());
});

const resolvers = new Map();

addEventListener('message', event => {
  // Handle input from the window client.
  if (event.data.type === SENDING_INPUT) {
    const resolverArray = resolvers.get(event.data.id);
    if (!resolverArray || resolverArray.length === 0) {
      console.error('Error handing input: No resolver');
      return;
    }

    const resolver = resolverArray.shift(); // Take the first promise in the array
    resolver(new Response(event.data.value, {status: 200}));
  }
});

addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname === SERVICE_WORKER_PATH) {
    const id = url.searchParams.get('id');
    const prompt = url.searchParams.get('prompt');

    event.waitUntil(
      (async () => {
        // Send AWAITING_INPUT message to all window clients
        self.clients.matchAll({includeUncontrolled: true}).then(clients => {
          clients.forEach(client => {
            if (client.type === 'window') {
              client.postMessage({
                type: AWAITING_INPUT,
                id,
                prompt,
              });
            }
          });
        });
      })()
    );

    const promise = new Promise(r =>
      resolvers.set(id, [...(resolvers.get(id) || []), r])
    );
    event.respondWith(promise);
  }
});
