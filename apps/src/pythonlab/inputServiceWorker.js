const AWAITING_INPUT = 'AWAITING_INPUT';
const SENDING_INPUT = 'SENDING_INPUT';
const SERVICE_WORKER_PATH = '/pythonlab-input-sw/';

addEventListener('install', () => {
  self.skipWaiting();
});

addEventListener('activate', () => {
  self.clients.claim();
});

const resolvers = new Map();

addEventListener('message', event => {
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
