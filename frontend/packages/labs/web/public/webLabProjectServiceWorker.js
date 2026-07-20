// The Web Lab project service worker. Ported from
// apps/src/weblab2/htmlPreview/weblab2_project_service_worker.js.
//
// It runs on the PREVIEW origin and serves the student's project out of memory:
// the preview page posts the files here, and every fetch the student's page
// makes is answered from that set (with the generated content-security policy
// attached). Requests that leave the project are reported — and optionally
// blocked — so the debug panel can show network activity.
//
// NOT BUNDLED: a service worker cannot import modules, so the message-type
// strings below are duplicated from src/preview/constants.ts. Keep them in sync.
// Written in conservative JS for the same reason.

const PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL = 'weblab2-file-preview';
const SERVING_HTML_FILE = 'SERVING_HTML_FILE';
const RECEIVED_SOURCE = 'RECEIVED_SOURCE';
const UPDATE_FILES = 'UPDATE_FILES';
const SET_BLOCK_NETWORK = 'SET_BLOCK_NETWORK';
const NETWORK_REQUEST = 'NETWORK_REQUEST';
const NETWORK_RESPONSE = 'NETWORK_RESPONSE';

function main() {
  let filesData = {};
  const broadcastChannel = new BroadcastChannel(
    PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL,
  );
  let contentSecurityPolicyValue = null;
  let blockNetworkRequests = false;

  addEventListener('install', () => {
    // Activate immediately rather than waiting for existing clients to close.
    self.skipWaiting();
  });

  addEventListener('activate', event => {
    // Take over any clients still held by an older worker on this path.
    event.waitUntil(self.clients.claim());
  });

  addEventListener('message', event => {
    const {type, files, contentSecurityPolicy} = event.data;
    // Only the preview page itself may load a project or change the policy.
    if (type === UPDATE_FILES && event.origin === location.origin) {
      filesData = files || {};
      broadcastChannel.postMessage({type: RECEIVED_SOURCE});
      contentSecurityPolicyValue = contentSecurityPolicy;
    } else if (type === SET_BLOCK_NETWORK && event.origin === location.origin) {
      blockNetworkRequests = !!event.data.blockNetwork;
    }
  });

  self.addEventListener('fetch', async event => {
    const url = new URL(event.request.url);
    let requestedFile = getFilenameFromUrl(url);
    const referrerFile = getFilenameFromUrl(new URL(event.request.referrer));
    if (filesData[referrerFile] && requestedFile === '') {
      // A request for the project root from inside the project: serve the page.
      requestedFile = 'index.html';
    }

    if (url.origin === location.origin && filesData[requestedFile]) {
      event.respondWith(
        handleProjectRequest(requestedFile, filesData[requestedFile]),
      );
      return;
    }

    // Report html requests we cannot serve too, so the URL bar can reflect a
    // page that does not exist.
    if (requestedFile.endsWith('.html')) {
      broadcastChannel.postMessage({
        type: SERVING_HTML_FILE,
        filePath: requestedFile,
      });
    }

    if (url.origin === location.origin) {
      return;
    }

    // A request leaving the project: report it, and block it if asked.
    const performanceStartTime = performance.now();
    const startTime = new Date().toLocaleString();
    const requestId = crypto.randomUUID();
    broadcastChannel.postMessage({
      type: NETWORK_REQUEST,
      requestData: {
        url: event.request.url,
        method: event.request.method,
        startTime,
        id: requestId,
        blocked: blockNetworkRequests,
      },
    });

    if (blockNetworkRequests) {
      // The request is already reported as blocked; no response to broadcast.
      event.respondWith(
        new Response(null, {
          status: 500,
          statusText: 'Network requests are blocked',
        }),
      );
      return;
    }

    let response;
    let performanceEndTime;
    let error;
    try {
      // A separate fetch: a response body can only be read once, so reading it
      // for the report would consume the one the page receives.
      response = await fetch(event.request);
      performanceEndTime = performance.now();
    } catch (e) {
      error = e;
    }
    let bodyText;
    try {
      bodyText = response ? await response.text() : undefined;
    } catch (e) {
      error = e;
    }
    broadcastChannel.postMessage({
      type: NETWORK_RESPONSE,
      responseData: {
        url: event.request.url,
        body: bodyText,
        status: response ? response.status : undefined,
        timeElapsed: performanceEndTime
          ? Math.floor(performanceEndTime - performanceStartTime)
          : undefined,
        error,
        id: requestId,
        contentType:
          response && response.headers && response.headers.get('Content-Type'),
      },
    });
  });

  function getFilenameFromUrl(url) {
    let requestedFile = url.pathname;
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
      // A file stored by URL (an uploaded asset) is fetched rather than inlined.
      // Legacy also rewrites /level_starter_assets/ onto the studio origin; that
      // depends on the deployment's hostname scheme, so the host handles it.
      if (url) {
        return await fetch(url);
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
        headers: {'Content-Type': 'text/plain'},
      });
    }
  }
}

const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined';
if (isServiceWorker) {
  main();
}
