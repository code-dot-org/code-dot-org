import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getUrlForFile, getFolderPath} from '@codebridge/utils';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import emptyPreviewPlaceholderImage from '@cdo/apps/codebridge/images/empty-preview-placeholder.svg';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {WEBLAB2_IMAGE_FILE_TYPES} from '@cdo/apps/weblab2/constants';

import {CodebridgeEmptyState} from '../components/CodebridgeEmptyState';

import {IframeMessageType} from './constants';
import {
  updateLinksToHtmlFiles,
  updateLinksToNonHtmlFiles,
} from './htmlParsingHelpers';

import moduleStyles from './styles/inner-html-preview.module.scss';
const NOT_FOUND_FILE = 'NOT_FOUND';

const InnerHTMLPreview = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [source, setSource] = React.useState<MultiFileSource | undefined>(
    undefined
  );
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  // const [blobUrl, setBlobUrl] = React.useState<string | undefined>(undefined);
  // const [filesToBlobs, setFilesToBlobs] = React.useState<
  //   Record<string, string>
  // >({});
  const [currentFile, setCurrentFile] = React.useState<string | undefined>(
    undefined
  );
  const [allowScripts, setAllowScripts] = useState(false);

  const parentOrigin = useMemo(() => {
    const regex = /preview\.([^.]+)\.codeprojects\.org/;
    const match = location.hostname.match(regex);
    const environment = match && match[1] ? `${match[1]}-` : '';
    const port = 'localhost-' === environment ? `:${location.port}` : '';
    const cdn = environment.includes('adhoc') ? 'cdn-' : '';
    return `${location.protocol}//${environment}studio.${cdn}code.org${port}`;
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(
          new URL(
            /* webpackChunkName: "project-service-worker-1.0.0" */
            './projectServiceWorker.js',
            // @ts-expect-error because TypeScript does not like this syntax.
            import.meta.url
          )
        )
        .then(registration => {
          console.log(
            'Project Service Worker registered with scope:',
            registration.scope
          );
          setServiceWorkerReady(true);
        });
    } else {
      console.error('Service workers are not supported in this browser.');
    }
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
          // todo: send something to service worker?
        } else {
          setSource(data.source);
        }
      } else if (data.type === IframeMessageType.CHANGE_FILE_HREF) {
        setCurrentFile(data.filePath);
        // Tell the parent that we are changing the file, as this came from a link click.
        window.parent.postMessage(
          {type: IframeMessageType.FILE_UPDATED, fileName: data.filePath},
          parentOrigin
        );
      } else if (data.type === IframeMessageType.CHANGE_FILE_URL_BAR) {
        setCurrentFile(data.fileName);
        // We don't need to update the parent, because they initiated this change.
      } else if (data.type === IframeMessageType.SET_ALLOW_SCRIPTS) {
        setAllowScripts(!!data.allow);
      } else if (data.type === IframeMessageType.REFRESH) {
        iframeRef.current?.contentWindow?.location.reload();
      }
    },
    [parentOrigin]
  );

  // Send source data to service worker when it changes
  useEffect(() => {
    if (serviceWorkerReady && source && navigator.serviceWorker.controller) {
      // Prepare files data for service worker
      const filesData: Record<string, {content: string; mimeType: string}> = {};

      Object.values(source.files).forEach(file => {
        const fullFileName = getFullyQualifiedFileName(
          file.name,
          file.folderId,
          source.folders
        );

        let content = file.contents;
        let mimeType = 'text/plain';

        // Determine MIME type based on file extension or language
        if (file.url) {
          // Right not only images are handled via URL
          content = file.url;
          mimeType = `image/${file.name.split('.').pop()?.toLowerCase()}`;
        } else if (file.language === 'html') {
          mimeType = 'text/html';
          // Process HTML files to update links
          const parser = new DOMParser();
          const doc = parser.parseFromString(file.contents, 'text/html');
          updateLinksToNonHtmlFiles(doc, {}, fullFileName);
          updateLinksToHtmlFiles(doc, fullFileName);
          content = doc.documentElement.outerHTML;
        } else if (file.language === 'css') {
          mimeType = 'text/css';
        } else if (file.language === 'javascript') {
          mimeType = 'application/javascript';
        }

        filesData[fullFileName] = {content, mimeType};
      });

      // Send files data to service worker
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_FILES',
        files: filesData,
        currentFile: currentFile,
      });
    }
  }, [serviceWorkerReady, source, currentFile, parentOrigin]);

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

  const getPreview = useCallback(() => {
    // if (blobUrl === NOT_FOUND_FILE) {
    //   return (
    //     <div className={moduleStyles.placeholderContainer}>
    //       <CodebridgeEmptyState
    //         imageProps={{src: emptyPreviewPlaceholderImage}}
    //         title="Nothing to preview"
    //         description="Your project preview will appear here once you've created or opened a page with content."
    //       />
    //     </div>
    //   );
    if (serviceWorkerReady) {
      return (
        <iframe
          ref={iframeRef}
          sandbox={`${allowScripts ? 'allow-scripts ' : ''}allow-same-origin`}
          allow="self"
          title="Inner HTML Preview"
          id="inner-preview"
          key={allowScripts ? 1 : 0} // This forces a re-render when allowScripts changes.
          src={`${window.location.origin}/assets/js/serve-project`}
          className={moduleStyles.fileIframe}
        />
      );
    } else {
      return (
        <div className={moduleStyles.placeholderContainer}>
          <CodebridgeEmptyState title="Loading..." />
        </div>
      );
    }
  }, [allowScripts, serviceWorkerReady]);

  return getPreview();
};

export default InnerHTMLPreview;
