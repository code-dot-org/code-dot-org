import {findFilePathByRelativePath} from '../utils';

import {IframeMessageType} from './constants';

// Remove any existing content security policy from the document, and
// add a new Content Security Policy to the document to allow for certain
// HTTP requests.
export const setContentSecurityPolicy = (doc: Document) => {
  // Remove any existing CSP meta tags, as we need to set our own.
  const existingCspTags = doc.querySelectorAll(
    'meta[http-equiv="Content-Security-Policy"]'
  );
  existingCspTags.forEach(tag => tag.remove());

  const metaTag = doc.createElement('meta');
  metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
  // TODO: Improve the list of allowed origins.
  // https://codedotorg.atlassian.net/browse/CT-579
  metaTag.setAttribute('content', "connect-src 'self' http://numbersapi.com");

  const head = doc.querySelector('head');
  if (head) {
    head.appendChild(metaTag);
  }
};

// Replace links to non-html files (css and js) with their appropriate blob URLs.
// We support <link> tags for CSS files and <script> tags for JavaScript files,
// and support both relative and absolute paths.
export const updateLinksToNonHtmlFiles = (
  doc: Document,
  filesToBlobs: Record<string, string>,
  fullFileName: string
) => {
  const links = doc.querySelectorAll('link[rel="stylesheet"], script[src]');
  links.forEach(link => {
    const src = link.getAttribute('src') || link.getAttribute('href');
    if (src) {
      const filePath = findFilePathByRelativePath(src, fullFileName);
      const blobUrl = filesToBlobs[filePath];
      if (blobUrl) {
        if (link.tagName.toLowerCase() === 'link') {
          link.setAttribute('href', blobUrl);
        } else {
          link.setAttribute('src', blobUrl);
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
