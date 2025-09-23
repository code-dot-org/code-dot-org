import {findFilePathByRelativePath} from '../utils';

import {IframeMessageType} from './constants';

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
