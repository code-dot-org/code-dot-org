import 'whatwg-fetch';

/**
 * The Service Worker which enables the offline PWA experience for Code.org. It is responsible for
 * caching html, javascript, images, etc so that they can be used when students don't have an
 * internet connection.
 */
const cacheVersion = 2;
const cacheName = `code-org-pwa-v${cacheVersion}`;

self.addEventListener('install', e => {
  console.log('[Service Worker] installing offline service worker!');
  // TODO - Add retry logic if cache.addAll fails for one of the assets.
  e.waitUntil(caches.open(cacheName).then(cache => cacheFiles(cache)));
});

async function cacheFiles(cache) {
  return getCachedFilesList().then(filepaths =>
    Promise.all(
      filepaths.map(async filepath =>
        cache
          .add(filepath)
          .catch(err => console.log(`Failed to cache ${filepath}`, err))
      )
    )
  );
}

self.addEventListener('fetch', event => {
  // TODO - Ignore query string parameters.
  event.respondWith(
    caches.open(cacheName).then(cache =>
      cache.match(event.request).then(
        response =>
          // Return the cached response, otherwise fetch it over the internet.
          response || fetch(event.request)
      )
    )
  );
});

async function getCachedFilesList() {
  // Request the manifest of all the files which should be cached.
  const response = await fetch('/offline-files.json', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  // TODO Add check for 404 status
  const responseJson = await response.json();
  return responseJson.files;
}
