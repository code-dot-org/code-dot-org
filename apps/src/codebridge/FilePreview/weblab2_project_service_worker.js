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

// TODO: Right now if you have multiple tabs open to different projects, the service worker will
// serve the most recent files to each tab, which means one tab will show the other tab's project.
// We are investigating solutions to this, such as registering a separate service worker per project via a subdomain.
// Do not make the service worker the default way of serving files until this is resolved.

function main() {
  let filesData = {};
  let cspImageSrcPolicy = '';
  const broadcastChannel = new BroadcastChannel(
    PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL
  );
  const codeDotOrgOrigin = getCodeDotOrgOrigin();

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
    const {type, files, cspImageSrc} = event.data;
    if (type === UPDATE_FILES && event.origin === location.origin) {
      filesData = files || {};
      cspImageSrcPolicy = cspImageSrc || '';
      broadcastChannel.postMessage({type: RECEIVED_SOURCE});
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

  // Inject a script into HTML that handles blocked images and displays a helpful message.
  function injectImageErrorHandler(htmlContent) {
    const script = `
<script data-cdo-injected="image-error-handler">
(function() {
  'use strict';
  
  // Style for the blocked image placeholder
  const style = document.createElement('style');
  style.textContent = \`
    img.cdo-blocked-image {
      display: inline-block;
      background: #f5f5f5;
      border: 2px dashed #999;
      border-radius: 4px;
      position: relative;
      min-width: 240px;
      min-height: 140px;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #333;
      text-align: center;
      vertical-align: middle;
    }
    img.cdo-blocked-image::after {
      content: attr(data-blocked-message);
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      background: white;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      white-space: pre-line;
      overflow: auto;
      line-height: 1.4;
    }
  \`;
  document.head.appendChild(style);
  
  // Check if a URL is external (not same-origin, not data/blob)
  function isExternalUrl(url) {
    if (!url) return false;
    if (url.startsWith('data:') || url.startsWith('blob:')) return false;
    try {
      const urlObj = new URL(url, window.location.href);
      return urlObj.origin !== window.location.origin;
    } catch (e) {
      return false;
    }
  }
  
  // Handle image error events
  function handleImageError(img) {
    const src = img.src || img.getAttribute('src');
    
    // Only handle external image errors (likely CSP violations)
    if (isExternalUrl(src)) {
      img.classList.add('cdo-blocked-image');
      img.setAttribute('data-blocked-message', '🚫 External Image Blocked\\n\\nOnly images from approved sources are allowed or upload your own!');
      img.removeAttribute('src'); // Prevent further attempts to load
    }
  }
  
  // Listen for errors on existing images
  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
      handleImageError(e.target);
    }
  }, true);
  
  // Monitor for dynamically added images
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.tagName === 'IMG') {
          node.addEventListener('error', function() {
            handleImageError(node);
          });
        }
        // Handle images in added subtrees
        if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(function(img) {
            img.addEventListener('error', function() {
              handleImageError(img);
            });
          });
        }
      });
    });
  });
  
  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Handle images already in the document
  window.addEventListener('load', function() {
    document.querySelectorAll('img').forEach(function(img) {
      img.addEventListener('error', function() {
        handleImageError(img);
      });
    });
  });
})();
</script>`;
    // Inject before closing </body> or </html> tag, whichever comes first
    const bodyCloseIndex = htmlContent.toLowerCase().lastIndexOf('</body>');
    const htmlCloseIndex = htmlContent.toLowerCase().lastIndexOf('</html>');
    if (bodyCloseIndex !== -1) {
      return (
        htmlContent.slice(0, bodyCloseIndex) +
        script +
        htmlContent.slice(bodyCloseIndex)
      );
    } else if (htmlCloseIndex !== -1) {
      return (
        htmlContent.slice(0, htmlCloseIndex) +
        script +
        htmlContent.slice(htmlCloseIndex)
      );
    } else {
      // No closing tags found, append to end
      return htmlContent + script;
    }
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
          fetchUrl = codeDotOrgOrigin + url;
        }
        return await fetch(fetchUrl);
      }
      const headers = {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      };

      let responseContent = content;

      // Apply CSP to HTML files to restrict image sources
      if (mimeType === 'text/html' && cspImageSrcPolicy) {
        headers[
          'Content-Security-Policy'
        ] = `img-src 'self' data: blob: ${cspImageSrcPolicy}`;
        // Inject script to handle blocked images with a user-friendly message
        responseContent = injectImageErrorHandler(content);
      }

      return new Response(responseContent, {
        status: 200,
        headers: headers,
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
