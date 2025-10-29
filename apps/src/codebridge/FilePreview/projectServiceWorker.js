//const SERVICE_WORKER_PATH = '/serve-project/';

addEventListener('install', () => {
  // Ensure this service worker is activated immediately.
  self.skipWaiting();
});

addEventListener('activate', event => {
  // Claim clients from any old service workers on this path.
  event.waitUntil(self.clients.claim());
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

  // Only handle requests to our serve-project endpoint
  if (
    url.pathname === '/serve-project' ||
    url.pathname.startsWith('/serve-project/')
  ) {
    event.respondWith(handleProjectRequest(url));
  }
});

async function handleProjectRequest(url) {
  try {
    let requestedFile = currentFile;

    // If a specific file is requested in the path
    if (url.pathname !== '/serve-project') {
      requestedFile =
        url.pathname.replace('/serve-project/', '') || currentFile;
    }

    // Remove leading slash if present
    if (requestedFile.startsWith('/')) {
      requestedFile = requestedFile.substring(1);
    }

    // Default to index.html if no file specified
    if (!requestedFile || requestedFile === '' || requestedFile === '/') {
      requestedFile = 'index.html';
    }

    console.log('Service worker serving file:', requestedFile);

    // Check if file exists in our files data
    if (filesData[requestedFile]) {
      const {content, mimeType} = filesData[requestedFile];

      return new Response(content, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'X-Frame-Options': 'ALLOWALL',
        },
      });
    } else {
      // File not found
      console.warn(
        'File not found:',
        requestedFile,
        'Available files:',
        Object.keys(filesData)
      );
      return new Response(`File not found: ${requestedFile}`, {
        status: 404,
        statusText: 'Not Found',
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
      statusText: 'Internal Server Error',
      'X-Frame-Options': 'ALLOWALL',
    });
  }
}
