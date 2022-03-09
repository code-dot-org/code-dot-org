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
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      const cachedFiles = await getCachedFilesList();
      console.log('[Service Worker] Caching:', cachedFiles);
      await cache.addAll(cachedFiles);
    })()
  );
});

async function getCachedFilesList() {
  // Request the manifest of all the files which should be cached.
  const response = await fetch('/cached-files.json', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  // TODO Add check for 404 status
  const responseJson = await response.json();
  return responseJson.cachedFiles;
}
