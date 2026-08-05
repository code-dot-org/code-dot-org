// The World Lab build transport service worker. Runs on the SANDBOX origin and
// serves compiled modules: the compile surface posts a bundle here (PUT_MODULE)
// AND writes it to CacheStorage (content-addressed), and the preview surface
// imports it by URL — the fetch is intercepted and answered from memory or, if
// this worker has been evicted / the page reloaded, from CacheStorage. Either
// way the preview's CSP stays `script-src 'self'` with no blob (PLAN §7,
// SANDBOX.md). The persistent tier is what lets an unchanged refresh skip the
// compile: the content-addressed URL is already stored (see buildCache.ts).
//
// NOT BUNDLED: a service worker cannot import modules, so the message-type
// strings and the cache name are duplicated from src/runtime (BuildWorkerMessage
// / BUILD_PATH_PREFIX / BUILD_CACHE_NAME). Keep them in sync. Conservative JS.

const BUILD_PATH_PREFIX = '/__world_build__/';
// Kept in sync with src/runtime/compile/buildCache.ts (BUILD_CACHE_NAME).
const BUILD_CACHE_NAME = 'world-build-v1';
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
    // Answer on the port the sender opened, when there is one. `event.source`
    // reaches a CONTROLLED client only, and the compile surface does not wait
    // to be controlled — so on a fast load that reply went nowhere and the
    // compile never completed (see storeModule in worldCompileWorkerManager).
    var port = event.ports && event.ports[0];
    if (port) {
      port.postMessage({type: MODULE_STORED, path: data.path});
    } else if (event.source) {
      event.source.postMessage({type: MODULE_STORED, path: data.path});
    }
  } else if (data.type === KEEP_ALIVE) {
    // Receiving the message is the point: it keeps the worker from idling out.
  }
});

function moduleResponse(code) {
  return new Response(code, {
    status: 200,
    headers: {
      'Content-Type': 'text/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

// Serve a build path from the in-memory map, falling back to the persistent
// CacheStorage (which survives reloads and this worker being evicted — the point
// of the compile cache). A true miss is a 404, never a network round trip: these
// are virtual URLs.
function serveBuild(pathname) {
  if (modules.has(pathname)) {
    return moduleResponse(modules.get(pathname));
  }
  return caches
    .open(BUILD_CACHE_NAME)
    .then(cache => cache.match(pathname))
    .then(hit =>
      hit
        ? hit
        : new Response('// world-build: not found\n', {
            status: 404,
            headers: {'Content-Type': 'text/javascript'},
          }),
    );
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(BUILD_PATH_PREFIX)
  ) {
    return;
  }
  event.respondWith(serveBuild(url.pathname));
});
