// The World Lab build transport service worker. Runs on the SANDBOX origin and
// serves compiled modules out of memory: the compile surface posts a bundle
// here (PUT_MODULE), and the preview surface imports it by URL — the fetch is
// intercepted and answered from memory, so the preview's CSP stays
// `script-src 'self'` with no blob (specs/PLAN.md §7, SANDBOX.md).
//
// NOT BUNDLED: a service worker cannot import modules, so the message-type
// strings are duplicated from src/runtime/messages.ts (BuildWorkerMessage /
// BUILD_PATH_PREFIX). Keep them in sync. Written in conservative JS.

const BUILD_PATH_PREFIX = '/__world_build__/';
const PUT_MODULE = 'put_module';
const MODULE_STORED = 'module_stored';
const KEEP_ALIVE = 'keep_alive';

// path -> compiled ESM source. In memory, so the worker's lifetime is
// load-bearing; the compile surface re-posts on each build and the preview
// pings KEEP_ALIVE, mirroring web-lab's project worker.
const modules = new Map();

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener('message', event => {
  const data = event.data || {};
  // Only same-origin clients (the compile/preview surfaces) may store or ping.
  if (event.origin && event.origin !== self.location.origin) {
    return;
  }
  if (data.type === PUT_MODULE) {
    modules.set(data.path, data.code);
    if (event.source) {
      event.source.postMessage({type: MODULE_STORED, path: data.path});
    }
  } else if (data.type === KEEP_ALIVE) {
    // Receiving the message is the point: it keeps the worker from idling out.
  }
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  if (url.pathname.startsWith(BUILD_PATH_PREFIX) && modules.has(url.pathname)) {
    event.respondWith(
      new Response(modules.get(url.pathname), {
        status: 200,
        headers: {
          'Content-Type': 'text/javascript',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }),
    );
  }
});
