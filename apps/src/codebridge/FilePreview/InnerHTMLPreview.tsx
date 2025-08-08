import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFolderPath} from '@codebridge/utils';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {IframeMessageType} from './constants';

import moduleStyles from './styles/inner-html-preview.module.scss';
const NOT_FOUND_FILE = 'NOT_FOUND';

const InnerHTMLPreview = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [source, setSource] = React.useState<MultiFileSource | undefined>(
    undefined
  );
  const [blobUrl, setBlobUrl] = React.useState<string | undefined>(undefined);
  const [filesToBlobs, setFilesToBlobs] = React.useState<
    Record<string, string>
  >({});
  const [currentFile, setCurrentFile] = React.useState<string | undefined>(
    undefined
  );
  const [hoveredElement, setHoveredElement] =
    React.useState<HTMLElement | null>(null);
  const [overlayElement, setOverlayElement] =
    React.useState<HTMLDivElement | null>(null);

  // This only works the first time the iframe loads. If the blob url changes,
  // it breaks.
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      setHoveredElement(target);
    };

    const handleMouseLeave = () => {
      setHoveredElement(null);
    };

    const setupEventListeners = () => {
      const iframeRefCurrent = iframeRef.current;
      const contentDocument = iframeRefCurrent?.contentDocument;

      if (contentDocument) {
        console.log('Setting up event listeners on iframe content');
        contentDocument.addEventListener('mousemove', handleMouseMove);
        contentDocument.addEventListener('mouseleave', handleMouseLeave);

        // Create overlay element for highlighting
        let overlay = contentDocument.getElementById(
          'element-highlight-overlay'
        ) as HTMLDivElement;
        if (!overlay) {
          overlay = contentDocument.createElement('div');
          overlay.id = 'element-highlight-overlay';
          overlay.style.cssText = `
        position: absolute;
        pointer-events: none;
        border: 2px solid #007acc;
        background-color: rgba(0, 122, 204, 0.1);
        z-index: 9999;
        display: none;
      `;
          contentDocument.body.appendChild(overlay);
        }
        setOverlayElement(overlay);

        // Create info tooltip
        let tooltip = contentDocument.getElementById(
          'element-info-tooltip'
        ) as HTMLDivElement;
        if (!tooltip) {
          tooltip = contentDocument.createElement('div');
          tooltip.id = 'element-info-tooltip';
          tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        pointer-events: none;
        z-index: 10000;
        display: none;
        white-space: nowrap;
      `;
          contentDocument.body.appendChild(tooltip);
        }

        return () => {
          contentDocument.removeEventListener('mousemove', handleMouseMove);
          contentDocument.removeEventListener('mouseleave', handleMouseLeave);

          // Clean up overlay and tooltip
          const overlayToRemove = contentDocument.getElementById(
            'element-highlight-overlay'
          );
          const tooltipToRemove = contentDocument.getElementById(
            'element-info-tooltip'
          );
          if (overlayToRemove) overlayToRemove.remove();
          if (tooltipToRemove) tooltipToRemove.remove();
        };
      }
      return undefined;
    };

    const iframeRefCurrent = iframeRef.current;

    if (iframeRefCurrent && blobUrl) {
      // If the iframe is already loaded, set up listeners immediately
      if (iframeRefCurrent.contentDocument?.readyState === 'complete') {
        return setupEventListeners();
      } else {
        // Otherwise, wait for the iframe to load
        const handleLoad = () => {
          console.log('Iframe loaded, setting up event listeners');
          setupEventListeners();
        };

        iframeRefCurrent.addEventListener('load', handleLoad);

        return () => {
          iframeRefCurrent.removeEventListener('load', handleLoad);
          const contentDocument = iframeRefCurrent.contentDocument;
          if (contentDocument) {
            contentDocument.removeEventListener('mousemove', handleMouseMove);
            contentDocument.removeEventListener('mouseleave', handleMouseLeave);
          }
        };
      }
    }
  }, [blobUrl]);

  // Effect to update overlay position and info when hoveredElement changes
  useEffect(() => {
    const iframeRefCurrent = iframeRef.current;
    if (
      iframeRefCurrent &&
      iframeRefCurrent.contentDocument &&
      overlayElement
    ) {
      const doc = iframeRefCurrent.contentDocument;
      const overlay = doc.getElementById(
        'element-highlight-overlay'
      ) as HTMLDivElement;
      const tooltip = doc.getElementById(
        'element-info-tooltip'
      ) as HTMLDivElement;

      if (hoveredElement && overlay && tooltip) {
        const rect = hoveredElement.getBoundingClientRect();
        const scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
        const scrollLeft =
          doc.documentElement.scrollLeft || doc.body.scrollLeft;

        // Position overlay
        overlay.style.display = 'block';
        overlay.style.top = `${rect.top + scrollTop}px`;
        overlay.style.left = `${rect.left + scrollLeft}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;

        // Update tooltip content
        const tagName = hoveredElement.tagName.toLowerCase();
        const id = hoveredElement.id;
        const className = hoveredElement.className;

        let tooltipText = `<${tagName}`;
        if (id) tooltipText += ` id="${id}"`;
        if (className) tooltipText += ` class="${className}"`;
        tooltipText += `>`;

        tooltip.textContent = tooltipText;
        tooltip.style.display = 'block';
        tooltip.style.top = `${rect.top + scrollTop - 25}px`;
        tooltip.style.left = `${rect.left + scrollLeft}px`;

        // Adjust tooltip position if it goes off-screen
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > doc.documentElement.clientWidth) {
          tooltip.style.left = `${
            rect.right + scrollLeft - tooltipRect.width
          }px`;
        }
        if (tooltipRect.top < 0) {
          tooltip.style.top = `${rect.bottom + scrollTop + 5}px`;
        }
      } else if (overlay && tooltip) {
        overlay.style.display = 'none';
        tooltip.style.display = 'none';
      }
    }
  }, [hoveredElement, overlayElement]);

  const parentOrigin = useMemo(() => {
    const regex = /preview\.([^.]+)\.codeprojects\.org/;
    const match = location.hostname.match(regex);
    const environment = match && match[1] ? `${match[1]}-` : '';
    const port = 'localhost-' === environment ? `:${location.port}` : '';
    const cdn = environment.includes('adhoc') ? 'cdn-' : '';
    return `${location.protocol}//${environment}studio.${cdn}code.org${port}`;
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // We either receive messages from ourselves (for file changes via href) or from the parent.
      if (event.origin !== parentOrigin && event.origin !== location.origin) {
        return;
      }
      const {data} = event;
      if (data.type === IframeMessageType.SET_SOURCE) {
        if (!data.source) {
          // Clear the preview if no source is provided. We are likely changing levels.
          setFilesToBlobs({});
          setBlobUrl(undefined);
        } else {
          setSource(data.source);
        }
      } else if (data.type === IframeMessageType.CHANGE_FILE_HREF) {
        setCurrentFile(data.fileName);
        // Tell the parent that we are changing the file, as this came from a link click.
        window.parent.postMessage(
          {type: IframeMessageType.FILE_UPDATED, fileName: data.fileName},
          parentOrigin
        );
      } else if (data.type === IframeMessageType.CHANGE_FILE_URL_BAR) {
        setCurrentFile(data.fileName);
        // We don't need to update the parent, because they initiated this change.
      }
    },
    [parentOrigin]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    // Notify parent that we're ready to receive messages
    window.parent.postMessage(
      {type: IframeMessageType.IFRAME_READY},
      parentOrigin
    );

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage, parentOrigin]);

  function getFullyQualifiedFileName(
    fileName: string,
    folderId: string,
    folders: MultiFileSource['folders']
  ) {
    if (folderId === DEFAULT_FOLDER_ID) {
      return fileName; // root folder, no path needed
    }
    const fullPath = getFolderPath(folderId, folders) + '/' + fileName;
    return fullPath.substring(1); // remove leading slash
  }

  useEffect(() => {
    if (currentFile && filesToBlobs) {
      const newBlobUrl = filesToBlobs[currentFile];
      if (newBlobUrl) {
        setBlobUrl(newBlobUrl);
      } else {
        console.error(`current file ${currentFile} not found in source files`);
        setBlobUrl(NOT_FOUND_FILE);
      }
    }
  }, [currentFile, filesToBlobs]);

  // TODOs:
  // Support other file types (images, etc.): https://codedotorg.atlassian.net/browse/CT-1255
  // More robust file paths: https://codedotorg.atlassian.net/browse/CT-1256
  // Better regeneration logic: https://codedotorg.atlassian.net/browse/CT-1259
  useEffect(() => {
    if (source) {
      const files: Record<string, string> = {};
      // Handle non-HTML files. These are just converted to Blobs.
      Object.values(source.files).forEach(file => {
        if (file.language !== 'html') {
          let fileType = '';
          if (file.language === 'css' || file.language === 'csv') {
            fileType = `text/${file.language}`;
          } else if (file.language === 'js') {
            fileType = 'text/javascript';
          } else {
            // TODO: handle other file types, like images
            fileType = file.language;
          }
          const blob = new Blob([file.contents], {type: fileType});
          const fullFileName = getFullyQualifiedFileName(
            file.name,
            file.folderId,
            source.folders
          );
          files[fullFileName] = URL.createObjectURL(blob);
        }
      });
      // Handle HTML files. We replace src links to non-html files with blob URLs.
      // We update links to other files with a click handler that will post a message to us
      // to change the file.
      const htmlFiles = Object.values(source.files).filter(
        file => file.language === 'html'
      );
      htmlFiles.forEach(file => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(file.contents, 'text/html');
        // Remove any existing CSP meta tags, as we need to set our own.
        const existingCspTags = doc.querySelectorAll(
          'meta[http-equiv="Content-Security-Policy"]'
        );
        existingCspTags.forEach(tag => tag.remove());

        const metaTag = doc.createElement('meta');
        metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
        // TODO: Improve the list of allowed origins.
        // https://codedotorg.atlassian.net/browse/CT-579
        metaTag.setAttribute(
          'content',
          "connect-src 'self' http://numbersapi.com"
        );

        const head = doc.querySelector('head');
        if (head) {
          head.appendChild(metaTag);
        }
        const links = doc.querySelectorAll(
          'link[rel="stylesheet"], script[src]'
        );
        links.forEach(link => {
          const src = link.getAttribute('src') || link.getAttribute('href');
          if (src && files[src]) {
            const blobUrl = files[src];
            if (link.tagName.toLowerCase() === 'link') {
              link.setAttribute('href', blobUrl);
            } else {
              link.setAttribute('src', blobUrl);
            }
          }
        });
        const fileLinks: NodeListOf<HTMLAnchorElement> =
          doc.querySelectorAll('a[href]');
        fileLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href?.endsWith('.html')) {
            link.setAttribute(
              'onclick',
              `event.preventDefault();
              window.parent.postMessage({type: '${IframeMessageType.CHANGE_FILE_HREF}', fileName: '${href}'}, '${location.origin}');
              return false;
            `
            );
          }
        });
        const updatedContents = doc.documentElement.outerHTML;
        const blob = new Blob([updatedContents], {type: 'text/html'});
        const fullFileName = getFullyQualifiedFileName(
          file.name,
          file.folderId,
          source.folders
        );
        files[fullFileName] = URL.createObjectURL(blob);
      });
      setFilesToBlobs(files);
    }
  }, [parentOrigin, source]);

  console.log(
    `You are hovering over a ${hoveredElement?.localName} with id ${hoveredElement?.id}`
  );

  // TODO: better loading/page not found UI.
  // https://codedotorg.atlassian.net/browse/CT-1258
  if (blobUrl === NOT_FOUND_FILE) {
    return <div>Page not found</div>;
  } else if (blobUrl) {
    return (
      <>
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin"
          allow="self"
          title="Inner HTML Preview"
          id="inner-preview"
          src={blobUrl}
          className={moduleStyles.fileIframe}
        />
      </>
    );
  } else {
    return <div>Loading...</div>;
  }
};

export default InnerHTMLPreview;
