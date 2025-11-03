// WARNING: THIS FILE IS NOT RUN THROUGH WEBPACK, so make sure you USE OLDER JAVASCRIPT SYNTAX
// (i.e. don't use things that weren't broadly supported before 2018).
//
// TMI: The reason its not run through webpack is that the webpacked entry point was not working as a
// service worker, some pollyfill or somesuch was depending on interfaces (like document) existing that
// aren't defined for service workers???
//
// This is served as preview.codeprojects.org/weblab2-project-service-worker.js by routes.rb and codeprojects_preview_controller.rb

function main() {
  let filesData = {};
  let currentFile = 'index.html'; // Default file
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
    sendMessageToAllClients('INSTALL');
  });

  addEventListener('activate', event => {
    // Claim clients from any old service workers on this path.
    event.waitUntil(self.clients.claim());
    sendMessageToAllClients('ACTIVATE');
  });

  // Listen for messages from the main thread
  self.addEventListener('message', event => {
    const {type, files, currentFile: newCurrentFile} = event.data;

    if (type === 'UPDATE_FILES') {
      filesData = files || {};
      if (newCurrentFile) {
        currentFile = newCurrentFile;
      }
      console.log('Service worker received files:', Object.keys(filesData));
      sendMessageToAllClients('RECEIVED_SOURCE');
    } else if (type === 'SET_CURRENT_FILE') {
      currentFile = newCurrentFile;
      console.log('Service worker current file set to:', currentFile);
    }
  });

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
      // TODO: why isn't this working?
      console.log('Returning for', url.pathname);
      //fetch(event.request);
      return;
    }
  });

  sendMessageToAllClients('SERVICE_WORKER_LOADED?');

  function getFilenameFromUrl(url) {
    let remainder = url.pathname;
    if (remainder.startsWith('/')) {
      remainder = remainder.substring(1);
    }
    // Allow ?file= overrides (optional enhancement)
    let requestedFile = remainder || currentFile || 'index.html';
    if (requestedFile === '' || requestedFile === '/') {
      requestedFile = 'index.html';
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
        sendMessageToAllClients(`Serving file: ${requestedFile}`);
        if (url) {
          sendMessageToAllClients('FETCHING_EXTERNAL_URL');
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

  function sendMessageToAllClients(messageType) {
    self.clients.matchAll({includeUncontrolled: true}).then(clients => {
      clients.forEach(client => {
        if (client.type === 'window') {
          client.postMessage({
            type: messageType,
          });
        }
      });
    });
  }
}

const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined';
if (isServiceWorker) {
  main();
  console.warn('I AM A SERVICE WORKER');
} else {
  console.warn('I AM NOT A SERVICE WORKER');
}
