let cacheName = "oceans-pwa-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log("=====Add to cache when installing SW=====");
      // only cache a small application shell
      let resourcesToAdd = ["/pwa_demo"];
      return cache.addAll(resourcesToAdd);
    })
  );
});

self.addEventListener("fetch", event => {
  console.log("---Request", event.request.url, "---");
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches
        .match(event.request, { ignoreSearch: true })
        .then(response => {
          if (response) {
            console.log("=====Found in cache", event.request.url, "=====");
          } else {
            console.log("=====NOT found in cache", event.request.url, "=====");
          }
          return response;
        });
    })
  );
});
