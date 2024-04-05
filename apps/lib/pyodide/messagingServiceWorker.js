import {serviceWorkerFetchListener} from 'sync-message';

const fetchListener = serviceWorkerFetchListener();

addEventListener('fetch', function (e) {
  console.log({fetchEvent: e});
  if (fetchListener(e)) {
    // This event has been handled by this library
    return;
  }
  // Otherwise, add your own service worker logic here,
  // e.g. passthrough to a normal network request:
  //e.respondWith(fetch(e.request));
});
