import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {useEffect, useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {getFolderPath} from '../utils';

import {addBaseTagToDocument} from './htmlParsingHelpers';

function useProjectServiceWorker(
  source: MultiFileSource | undefined,
  currentFile: string | undefined
) {
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(
    null
  );
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
          //{scope: '/'}
        )
        .then(registration => {
          console.log(
            'Project Service Worker registered with scope:',
            registration.scope
          );
          if (registration.active) {
            console.log('found active service worker');
            setServiceWorker(registration.active);
          }
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  setServiceWorker(installingWorker);
                }
              });
            }
          });
          navigator.serviceWorker.onmessage = event => {
            console.log('Received message from service worker:', event);
            if (event.data.type === 'RECEIVED_SOURCE') {
              console.log('received source acknowledged by service worker');
              setServiceWorkerReady(true);
            }
          };
        });
    } else {
      console.error('Service workers are not supported in this browser.');
    }
  }, []);

  // Send source data to service worker when it changes
  useEffect(() => {
    if (serviceWorker && source) {
      console.log('Sending source data to service worker:', source);
      // Prepare files data for service worker
      const filesData: Record<
        string,
        {content: string; mimeType: string; url: string | undefined}
      > = {};

      Object.values(source.files).forEach(file => {
        const {fullFileName, folder} = getFullyQualifiedFileName(
          file.name,
          file.folderId,
          source.folders
        );

        let content = file.contents;
        let mimeType = 'text/plain';
        let url = undefined;

        // Determine MIME type based on file extension or language
        if (file.url) {
          // Right not only images are handled via URL
          url = file.url;
          mimeType = `image/${file.name.split('.').pop()?.toLowerCase()}`;
        } else if (file.language === 'html') {
          mimeType = 'text/html';
          // Process HTML files to add base tag
          const parser = new DOMParser();
          const doc = parser.parseFromString(file.contents, 'text/html');
          addBaseTagToDocument(
            doc,
            `${window.location.origin}/assets/js/serve-project/${folder}/`
          );
          content = doc.documentElement.outerHTML;
        } else if (file.language === 'css') {
          mimeType = 'text/css';
        } else if (file.language === 'js') {
          mimeType = 'application/javascript';
        }

        filesData[fullFileName] = {content, mimeType, url};
      });
      console.log({filesData});

      // Send files data to service worker
      serviceWorker.postMessage({
        type: 'UPDATE_FILES',
        files: filesData,
        currentFile: currentFile,
      });
    } else {
      console.log('skipping sending to service worker', {
        serviceWorker,
        source,
      });
    }
  }, [serviceWorker, source, currentFile]);

  function getFullyQualifiedFileName(
    fileName: string,
    folderId: string,
    folders: MultiFileSource['folders']
  ) {
    if (folderId === DEFAULT_FOLDER_ID) {
      return {fullFileName: fileName, folder: ''}; // root folder, no path needed
    }
    const folderPath = getFolderPath(folderId, folders);
    const fullPath = folderPath + '/' + fileName;
    return {fullFileName: fullPath.substring(1), folder: folderPath}; // remove leading slash
  }

  return {serviceWorkerReady};
}

export default useProjectServiceWorker;
