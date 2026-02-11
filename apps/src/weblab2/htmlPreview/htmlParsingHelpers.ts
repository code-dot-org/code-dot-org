import {findFilePathByRelativePath} from '@codebridge/utils';

import {
  IframeMessageType,
  PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL,
} from './constants';

// Replace links to non-html files (css and js) with their appropriate URLs (either blobs or external URLs).
// We support <link> tags for CSS files, <script> tags for JavaScript files, and <img> tags for images,
// and support both relative and absolute paths.
export const updateLinksToNonHtmlFiles = (
  doc: Document,
  filesToUrls: Record<string, string>,
  fullFileName: string
) => {
  const imgLinks = doc.querySelectorAll('img[src]');
  imgLinks.forEach(link => {
    const src = link.getAttribute('src');

    // Only update if the URL does not include a domain (eg, user project assets and starter assets)
    if (src && !(src.startsWith('http://') || src.startsWith('https://'))) {
      const filePath = findFilePathByRelativePath(src, fullFileName);
      const url = filesToUrls[filePath];
      link.setAttribute('src', url);
    }
  });

  const links = doc.querySelectorAll('link[rel="stylesheet"], script[src]');
  links.forEach(link => {
    const src = link.getAttribute('src') || link.getAttribute('href');
    if (src) {
      const filePath = findFilePathByRelativePath(src, fullFileName);
      const url = filesToUrls[filePath];
      if (url) {
        if (link.tagName.toLowerCase() === 'link') {
          link.setAttribute('href', url);
        } else {
          link.setAttribute('src', url);
        }
      }
    }
  });
};

// Update links to HTML files to include an onclick event. This will
// send a message to the parent window telling it which file to navigate to.
export const updateLinksToHtmlFiles = (doc: Document, fullFileName: string) => {
  const fileLinks: NodeListOf<HTMLAnchorElement> =
    doc.querySelectorAll('a[href]');
  fileLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href?.endsWith('.html')) {
      const filePath = findFilePathByRelativePath(href, fullFileName);
      link.setAttribute(
        'onclick',
        `event.preventDefault();
        window.parent.postMessage({type: '${IframeMessageType.CHANGE_FILE_HREF}', filePath: '${filePath}'}, '${location.origin}');
        return false;
      `
      );
    }
  });
};

const handleCSPViolationScript = `
document.addEventListener("securitypolicyviolation",function(e){
  const broadcastChannel = new BroadcastChannel("${PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL}");
  const requestId = Date.now().toString();
  broadcastChannel.postMessage({
    type: "CSP_VIOLATION",
    url: e.blockedURI,
    effectiveDirective: e.effectiveDirective,
    requestId,
    timestamp: new Date().toLocaleString()
  });
  broadcastChannel.close();
});
`;

// Adds a script to the document that listens for CSP violations and broadcasts them
// via BroadcastChannel so the parent can be notified.
export const addCSPViolationListenerToDocument = (doc: Document) => {
  const script = doc.createElement('script');
  script.textContent = handleCSPViolationScript;
  const head = doc.querySelector('head');
  if (head) {
    head.insertBefore(script, head.firstChild);
  } else {
    doc.documentElement.insertBefore(script, doc.documentElement.firstChild);
  }
};

// This adds a base tag to the header of the given document, setting its href to the provided baseHref.
// If a base tag already exists, its href is updated.
export const addBaseTagToDocument = (doc: Document, baseHref: string) => {
  let baseTag = doc.querySelector('base');
  if (!baseTag) {
    baseTag = doc.createElement('base');
    const head = doc.querySelector('head');
    if (head) {
      head.insertBefore(baseTag, head.firstChild);
    } else {
      doc.documentElement.insertBefore(baseTag, doc.documentElement.firstChild);
    }
  }
  baseTag.setAttribute('href', baseHref);
};
