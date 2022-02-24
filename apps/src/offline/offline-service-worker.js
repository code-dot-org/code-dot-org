const cacheVersion = 1;
const cacheName = `code-org-pwa-v${cacheVersion}`;
const cachedFiles = ['/s/express-2021/lessons/1/levels/1'];

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
