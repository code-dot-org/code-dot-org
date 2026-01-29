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
const CSP_VIOLATION = 'CSP_VIOLATION';

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
        }
        return await fetch(fetchUrl);
      }

      // For HTML files, inject CSP violation listener script
      var modifiedContent = content;
      if (mimeType === 'text/html') {
        modifiedContent = injectCSPViolationListener(content);
      }

      return new Response(modifiedContent, {
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

  // Inject a script into HTML to listen for CSP violations and show inline error messages
  function injectCSPViolationListener(htmlContent) {
    var cspListenerScript =
      '<style>' +
      '.csp-blocked-image-container {' +
      '  display: inline-block;' +
      '  border: 2px solid #ffc107;' +
      '  background-color: #fff3cd;' +
      '  padding: 8px 10px;' +
      '  border-radius: 4px;' +
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
      '  max-width: 100%;' +
      '  min-width: 300px;' +
      '  box-sizing: border-box;' +
      '}' +
      '.csp-blocked-image-header {' +
      '  display: flex;' +
      '  align-items: center;' +
      '  gap: 6px;' +
      '  margin-bottom: 4px;' +
      '  font-weight: bold;' +
      '  color: #856404;' +
      '  font-size: 13px;' +
      '}' +
      '.csp-blocked-image-icon {' +
      '  font-size: 16px;' +
      '  flex-shrink: 0;' +
      '}' +
      '.csp-blocked-image-details {' +
      '  font-size: 11px;' +
      '  color: #856404;' +
      '  line-height: 1.3;' +
      '  margin-bottom: 4px;' +
      '}' +
      '.csp-blocked-image-url {' +
      '  background-color: rgba(0, 0, 0, 0.1);' +
      '  padding: 3px 5px;' +
      '  border-radius: 3px;' +
      '  font-family: monospace;' +
      '  font-size: 10px;' +
      '  display: block;' +
      '  word-break: break-all;' +
      '}' +
      '</style>' +
      '<script>' +
      '(function() {' +
      "  var channel = new BroadcastChannel('" +
      PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL +
      "');" +
      '  var reportedViolations = new Set();' +
      '  var imageUrlToElements = new Map();' +
      '' +
      '  function replaceImageWithError(img, blockedURL) {' +
      '    if (img.hasAttribute("data-csp-replaced")) return;' +
      '    img.setAttribute("data-csp-replaced", "true");' +
      '' +
      '    var container = document.createElement("div");' +
      '    container.className = "csp-blocked-image-container";' +
      '' +
      '    var computedStyle = window.getComputedStyle(img);' +
      '    var width = img.width || parseInt(computedStyle.width) || 300;' +
      '    if (width > 0) {' +
      '      container.style.maxWidth = Math.max(width, 300) + "px";' +
      '    }' +
      '' +
      '    if (computedStyle.display === "block") {' +
      '      container.style.display = "block";' +
      '    }' +
      '' +
      '    var header = document.createElement("div");' +
      '    header.className = "csp-blocked-image-header";' +
      '    header.innerHTML = ' +
      '      \'<span class="csp-blocked-image-icon">\\u26A0\\uFE0F</span>\' +' +
      "      '<span>Image URL Not Allowed</span>';" +
      '' +
      '    var details = document.createElement("div");' +
      '    details.className = "csp-blocked-image-details";' +
      '    details.textContent = "This image cannot be loaded because its URL is not on the allowlist.";' +
      '' +
      '    var urlDisplay = document.createElement("code");' +
      '    urlDisplay.className = "csp-blocked-image-url";' +
      '    urlDisplay.textContent = blockedURL;' +
      '' +
      '    container.appendChild(header);' +
      '    container.appendChild(details);' +
      '    container.appendChild(urlDisplay);' +
      '' +
      '    if (img.parentNode) {' +
      '      img.parentNode.replaceChild(container, img);' +
      '    }' +
      '  }' +
      '' +
      '  function findAndReplaceImage(blockedURL) {' +
      '    var images = document.querySelectorAll("img");' +
      '    for (var i = 0; i < images.length; i++) {' +
      '      var img = images[i];' +
      '      var imgSrc = img.src || img.getAttribute("src") || "";' +
      '      if (imgSrc && (imgSrc === blockedURL || imgSrc.indexOf(blockedURL) !== -1 || blockedURL.indexOf(imgSrc) !== -1)) {' +
      '        replaceImageWithError(img, blockedURL);' +
      '        return;' +
      '      }' +
      '    }' +
      '  }' +
      '' +
      '  document.addEventListener("error", function(e) {' +
      '    if (e.target && e.target.tagName === "IMG") {' +
      '      var img = e.target;' +
      '      var src = img.src || img.getAttribute("src");' +
      '      if (src && !imageUrlToElements.has(src)) {' +
      '        imageUrlToElements.set(src, img);' +
      '      }' +
      '    }' +
      '  }, true);' +
      '' +
      "  document.addEventListener('securitypolicyviolation', function(e) {" +
      "    if (e.violatedDirective.startsWith('img-src')) {" +
      "      var violationKey = e.blockedURI + ':' + e.sourceFile;" +
      '      if (!reportedViolations.has(violationKey)) {' +
      '        reportedViolations.add(violationKey);' +
      '        channel.postMessage({' +
      "          type: '" +
      CSP_VIOLATION +
      "'," +
      '          blockedURI: e.blockedURI,' +
      '        });' +
      '' +
      '        setTimeout(function() {' +
      '          findAndReplaceImage(e.blockedURI);' +
      '        }, 100);' +
      '      }' +
      '    }' +
      '  });' +
      '})();' +
      '</script>';

    // Inject the script at the beginning of the <head> or <html> tag
    var headMatch = htmlContent.match(/<head[^>]*>/i);
    if (headMatch) {
      return htmlContent.replace(
        /<head[^>]*>/i,
        headMatch[0] + cspListenerScript
      );
    }
    var htmlMatch = htmlContent.match(/<html[^>]*>/i);
    if (htmlMatch) {
      return htmlContent.replace(
        /<html[^>]*>/i,
        htmlMatch[0] + cspListenerScript
      );
    }
    // If no <head> or <html> tag, prepend the script
    return cspListenerScript + htmlContent;
  }
}

const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined';
if (isServiceWorker) {
  main();
}
