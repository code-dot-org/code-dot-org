/**
 * The Service Worker which enables the offline PWA experience for Code.org. It is responsible for
 * caching html, javascript, images, etc so that they can be used when students don't have an
 * internet connection.
 */
const cacheVersion = 2;
const cacheName = `code-org-pwa-v${cacheVersion}`;
// const webpackManifest = require('../../build/package/js/webpackManifest.json');

//TODO this path doesn't work
const cachedFiles = require('./cachedFiles.json').cachedFiles;

console.log('ANNA CACHEDFILES', cachedFiles);

self.addEventListener('install', e => {
  console.log('[Service Worker] installing offline service worker!');
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching:', cachedFiles);
      await cache.addAll(cachedFiles);
    })()
  );
});
