// TODO: we see an error from using import because this is not a module file.
// Figure out how to compile this file and serve it up somewhere we can access
// it via url.
import {serviceWorkerFetchListener} from 'sync-message';


// Intercepts sync-message requests to support things like input() and sleep()
// Not relating to caching etc.
addEventListener('fetch', serviceWorkerFetchListener());

// const fetchListener = serviceWorkerFetchListener();

// addEventListener('fetch', function (e) {
//   console.log(e);
//   if (fetchListener(e)) {
//     // This event has been handled by this library
//     return;
//   }
//   // Otherwise, add your own service worker logic here,
//   // e.g. passthrough to a normal network request:
//   //e.respondWith(fetch(e.request));
// });
