// WARNING: THIS FILE IS NOT RUN THROUGH WEBPACK, so make sure you USE OLDER JAVASCRIPT SYNTAX
// (i.e. don't use things that weren't broadly supported before 2018).
//
// TMI: The reason its not run through webpack is that the webpacked entry point was not working as a
// service worker, some pollyfill or somesuch was depending on interfaces (like document) existing that
// aren't defined for service workers???
//
// This is served as preview.codeprojects.org/weblab2-project-service-worker.js by routes.rb and codeprojects_preview_controller.rb

// These constants are duplicated to constants.ts. Service workers cannot import modules.
const DEFAULT_START_HTML_FILE = 'index.html';
const PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL = 'weblab2-file-preview';
// These are duplicated to the ProjectServiceWorkerMessageType enum in constants.ts
const SERVING_HTML_FILE = 'SERVING_HTML_FILE';
const RECEIVED_SOURCE = 'RECEIVED_SOURCE';
const UPDATED_CURRENT_FILE = 'UPDATED_CURRENT_FILE';
const UPDATE_FILES = 'UPDATE_FILES';
const SET_CURRENT_FILE = 'SET_CURRENT_FILE';
const SERVICE_WORKER_INSTALLED = 'SERVICE_WORKER_INSTALLED';
const SERVICE_WORKER_ACTIVATED = 'SERVICE_WORKER_ACTIVATED';

function main() {
  let filesData = {};
  let currentFile = DEFAULT_START_HTML_FILE; // Default file
  const broadcastChannel = new BroadcastChannel(
    PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL
  );

  const IGNORED_FILE_PATHS = [
    '/',
    '/shared/css/fonts/barlow-semi-condensed.scss',
    '/fonts/barlowSemiCondensed/BarlowSemiCondensed-SemiBold.ttf',
    '/shared/css/fonts/figtree.scss',
    '/assets/js/webpack-runtime.js',
    '/assets/js/codeprojects_preview/show.js',
    '/assets/application.js',
    '/assets/js/vendors.js',
    '/assets/js/code-studio-common.js',
  ];

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
    const {type, files, currentFile: newCurrentFile} = event.data;
    if (type === UPDATE_FILES) {
      filesData = files || {};
      if (newCurrentFile) {
        currentFile = newCurrentFile;
      }
      console.log('Service worker received files:', Object.keys(filesData));
      broadcastChannel.postMessage({type: RECEIVED_SOURCE});
    } else if (type === SET_CURRENT_FILE) {
      currentFile = newCurrentFile;
      console.log('Service worker current file set to:', currentFile);
      broadcastChannel.postMessage({type: UPDATED_CURRENT_FILE});
    }
  };

  // Intercept fetch requests
  self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (
      url.origin === location.origin &&
      !IGNORED_FILE_PATHS.includes(url.pathname)
    ) {
      console.log('Service worker intercepting fetch for:', url.pathname);
      event.respondWith(handleProjectRequest(url));
    } else {
      console.log('Returning for', url.pathname);
      return;
    }
  });

  function getFilenameFromUrl(url) {
    let remainder = url.pathname;
    if (remainder.startsWith('/')) {
      remainder = remainder.substring(1);
    }
    let requestedFile = remainder || currentFile || DEFAULT_START_HTML_FILE;
    if (requestedFile === '' || requestedFile === '/') {
      requestedFile = DEFAULT_START_HTML_FILE;
    }

    // Normalize (remove accidental leading slash)
    if (requestedFile.startsWith('/')) {
      requestedFile = requestedFile.slice(1);
    }
    return requestedFile;
  }

  async function handleProjectRequest(url) {
    try {
      const requestedFile = getFilenameFromUrl(url);

      console.log('Service worker serving file:', requestedFile);

      if (filesData[requestedFile]) {
        const {content, mimeType, url} = filesData[requestedFile];
        if (requestedFile.endsWith('.html')) {
          console.log('Broadcasting HTML file serving:', requestedFile);
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
      } else {
        console.warn(
          'File not found:',
          requestedFile,
          'Available files:',
          Object.keys(filesData)
        );
        return new Response(`File not found: ${requestedFile}`, {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
            'X-Frame-Options': 'ALLOWALL',
          },
        });
      }
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
} else {
  console.warn('I AM NOT A SERVICE WORKER');
}
