// WARNING: THIS FILE IS NOT RUN THROUGH WEBPACK, so make sure you USE OLDER JAVASCRIPT SYNTAX
// (i.e. don't use things that weren't broadly supported before 2018).
//
// TMI: The reason its not run through webpack is that the webpacked entry point was not working as a
// service worker, some pollyfill or somesuch was depending on interfaces (like document) existing that
// aren't defined for service workers???
//
// This is served as preview.codeprojects.org/weblab2-project-service-worker.js by routes.rb and codeprojects_preview_controller.rb

// These constants are duplicated to constants.ts. Service workers cannot import modules.
const PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL = 'weblab2-file-preview';
// These are duplicated to the ProjectServiceWorkerMessageType enum in constants.ts
const SERVING_HTML_FILE = 'SERVING_HTML_FILE';
const RECEIVED_SOURCE = 'RECEIVED_SOURCE';
const UPDATE_FILES = 'UPDATE_FILES';
const SERVICE_WORKER_INSTALLED = 'SERVICE_WORKER_INSTALLED';
const SERVICE_WORKER_ACTIVATED = 'SERVICE_WORKER_ACTIVATED';

// bugs to fix:
// on firefox on adhoc, if you are on a page not found page and navigate to a new level, the page not found persists
// until you type in a new filename and hit enter (you can't refresh or press enter on index.html, you have to do a different filename, then go back to index.html)
// flash of outdated content when switching levels (sometimes)

function main() {
  let filesData = {};
  const broadcastChannel = new BroadcastChannel(
    PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL
  );

  addEventListener('install', () => {
    // Ensure this service worker is activated immediately.
    self.skipWaiting();
    broadcastChannel.postMessage({type: SERVICE_WORKER_INSTALLED});
  });

  addEventListener('activate', event => {
    // Claim clients from any old service workers on this path.
    event.waitUntil(self.clients.claim());
    broadcastChannel.postMessage({type: SERVICE_WORKER_ACTIVATED});
  });

  // Listen for messages from the main thread
  broadcastChannel.onmessage = event => {
    const {type, files} = event.data;
    if (type === UPDATE_FILES) {
      filesData = files || {};
      console.log('Service worker received files:', Object.keys(filesData));
      broadcastChannel.postMessage({type: RECEIVED_SOURCE});
    }
  };

  // Intercept fetch requests
  self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    let requestedFile = getFilenameFromUrl(url);
    const referrerFile = getFilenameFromUrl(new URL(event.request.referrer));
    if (filesData[referrerFile] && requestedFile === '') {
      // If the request is for the root of the project and it's coming from a file in the project,
      // return index.html instead of trying to fetch a non-existent root file.
      console.log('getting index.html for referrer', {referrerFile, url});
      requestedFile = 'index.html';
    }
    if (url.origin === location.origin && filesData[requestedFile]) {
      console.log('Service worker intercepting fetch for:', url.pathname);
      event.respondWith(
        handleProjectRequest(requestedFile, filesData[requestedFile])
      );
    } else {
      console.log('Returning for', url.pathname);
      // Still send SERVING_HTML_FILE message for non-project files.
      // This allows the URL bar to update correctly when an invalid url is requested.
      if (requestedFile.endsWith('.html')) {
        broadcastChannel.postMessage({
          type: SERVING_HTML_FILE,
          filePath: requestedFile,
        });
      }
      return;
    }
  });

  function getFilenameFromUrl(url) {
    let requestedFile = url.pathname;

    // Normalize (remove accidental leading slash)
    while (requestedFile.startsWith('/')) {
      requestedFile = requestedFile.slice(1);
    }
    return requestedFile;
  }

  async function handleProjectRequest(requestedFile, fileData) {
    try {
      const {content, mimeType, url} = fileData;
      if (requestedFile.endsWith('.html')) {
        broadcastChannel.postMessage({
          type: SERVING_HTML_FILE,
          filePath: requestedFile,
        });
      }
      if (url) {
        const response = await fetch(url);
        return response;
      }
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          // Intentionally omit SAMEORIGIN; ALLOWALL is non‑standard but keeps older code path.
          'X-Frame-Options': 'ALLOWALL',
        },
      });
    } catch (error) {
      console.error('Service worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'X-Frame-Options': 'ALLOWALL',
        },
      });
    }
  }
}

const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined';
if (isServiceWorker) {
  main();
  console.warn('I AM A SERVICE WORKER');
  // send broadcast message that the service worker has been started?
} else {
  console.warn('I AM NOT A SERVICE WORKER');
}
