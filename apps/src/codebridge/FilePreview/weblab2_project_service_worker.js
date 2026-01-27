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

function main() {
  let filesData = {};
  const broadcastChannel = new BroadcastChannel(
    PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL
  );
  const codeDotOrgOrigin = getCodeDotOrgOrigin();
  // Generate a cache bust suffix for this service worker instance.
  const cacheBustSuffix = Date.now().toString();
  let contentSecurityPolicyValue = null;

  addEventListener('install', () => {
    // Ensure this service worker is activated immediately.
    self.skipWaiting();
  });

  addEventListener('activate', event => {
    // Claim clients from any old service workers on this path.
    event.waitUntil(self.clients.claim());
  });

  // Listen for messages from the main thread
  addEventListener('message', event => {
    const {type, files, contentSecurityPolicy} = event.data;
    if (type === UPDATE_FILES && event.origin === location.origin) {
      filesData = files || {};
      broadcastChannel.postMessage({type: RECEIVED_SOURCE});
      contentSecurityPolicyValue = contentSecurityPolicy;
    }
  });

  // Intercept fetch requests
  self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    let requestedFile = getFilenameFromUrl(url);
    const referrerFile = getFilenameFromUrl(new URL(event.request.referrer));
    if (filesData[referrerFile] && requestedFile === '') {
      // If the request is for the root of the project and it's coming from a file in the project,
      // return index.html instead of trying to fetch a non-existent root file.
      requestedFile = 'index.html';
    }
    if (url.origin === location.origin && filesData[requestedFile]) {
      event.respondWith(
        handleProjectRequest(requestedFile, filesData[requestedFile])
      );
    } else {
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

    // Normalize (remove accidental leading slash(es))
    while (requestedFile.startsWith('/')) {
      requestedFile = requestedFile.slice(1);
    }
    return requestedFile;
  }

  // Code.org origin for this environment.
  function getCodeDotOrgOrigin() {
    const regex = /[^.]+\.preview\.([^.]+)\.codeprojects\.org/;
    const match = location.hostname.match(regex);
    const environment = match && match[1] ? `${match[1]}-` : '';
    const port =
      'localhost-' === environment && location.port ? `:${location.port}` : '';
    const cdn = environment.includes('adhoc') ? 'cdn-' : '';
    return `${location.protocol}//${environment}studio.${cdn}code.org${port}`;
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
        let fetchUrl = url;
        if (url.startsWith('/level_starter_assets/')) {
          // We fetch level starter assets from the code.org origin for this environment.
          // We use a cache-busting query parameter to ensure that we get the correct response headers,
          // specifically to avoid CORs issues with Access-Control-Allow-Origin being set to someone else's
          // preview url.
          const cacheBust = `?cache-bust=${cacheBustSuffix}`;
          fetchUrl = codeDotOrgOrigin + url + cacheBust;
          console.log({fetchUrl});
        }
        return await fetch(fetchUrl);
      }
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'Content-Security-Policy': contentSecurityPolicyValue || '',
        },
      });
    } catch (error) {
      console.error('Service worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  }
}

const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined';
if (isServiceWorker) {
  main();
}
