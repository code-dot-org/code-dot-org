const SERVICE_WORKER_PATH = '/serve-project/';

const SENDING_PROJECT = 'SENDING_PROJECT';

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
  if (event.data.type === SENDING_PROJECT) {
    const resolverArray = resolvers.get(event.data.id);
    if (!resolverArray || resolverArray.length === 0) {
      console.error('Error handing input: No resolver');
      return;
    }
    console.log('Received project data in service worker');
    // const resolver = resolverArray.shift(); // Take the first promise in the array
    // resolver(new Response(event.data.value, {status: 200}));
  }
});

addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  console.log({url});

  if (url.pathname === SERVICE_WORKER_PATH) {
    console.log('hi from fetch listener');
  }
});
