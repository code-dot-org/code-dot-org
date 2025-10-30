const SERVE_PROJECT_SEGMENT = '/serve-project';

addEventListener('install', () => {
  // Ensure this service worker is activated immediately.
  self.skipWaiting();
  sendDummyMessageToAllClients('INSTALL');
});

addEventListener('activate', event => {
  // Claim clients from any old service workers on this path.
  event.waitUntil(self.clients.claim());
  sendDummyMessageToAllClients('ACTIVATE');
});

let filesData = {};
let currentFile = 'index.html'; // Default file

// Listen for messages from the main thread
self.addEventListener('message', event => {
  const {type, files, currentFile: newCurrentFile} = event.data;

  if (type === 'UPDATE_FILES') {
    filesData = files || {};
    if (newCurrentFile) {
      currentFile = newCurrentFile;
    }
    console.log('Service worker received files:', Object.keys(filesData));
  } else if (type === 'SET_CURRENT_FILE') {
    currentFile = newCurrentFile;
    console.log('Service worker current file set to:', currentFile);
  }
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.includes(SERVE_PROJECT_SEGMENT)) {
    event.respondWith(handleProjectRequest(url));
  }
});

sendDummyMessageToAllClients('SERVICE_WORKER_LOADED?');

async function handleProjectRequest(url) {
  try {
    // Extract portion after /serve-project
    const idx = url.pathname.indexOf(SERVE_PROJECT_SEGMENT);
    let remainder = url.pathname.substring(idx + SERVE_PROJECT_SEGMENT.length); // maybe "" or "/some/file"
    if (remainder.startsWith('/')) {
      remainder = remainder.substring(1);
    }

    // Allow ?file= overrides (optional enhancement)
    const qpFile = url.searchParams.get('file');
    let requestedFile = qpFile || remainder || currentFile || 'index.html';

    if (requestedFile === '' || requestedFile === '/') {
      requestedFile = 'index.html';
    }

    // Normalize (remove accidental leading slash)
    if (requestedFile.startsWith('/')) {
      requestedFile = requestedFile.slice(1);
    }

    console.log('Service worker serving file:', requestedFile);

    if (filesData[requestedFile]) {
      const {content, mimeType} = filesData[requestedFile];
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

function sendDummyMessageToAllClients(messageType) {
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
