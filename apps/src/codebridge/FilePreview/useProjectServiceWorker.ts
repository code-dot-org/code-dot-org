import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {useEffect, useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {getFolderPath} from '../utils';

import {
  ProjectServiceWorkerMessageType,
  generateImageSrcCSPPolicy,
} from './constants';
import {addBaseTagToDocument} from './htmlParsingHelpers';

// Hook that handles registering and communicating with the project service worker.
function useProjectServiceWorker(source: MultiFileSource | undefined) {
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(
    null
  );
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<
    ServiceWorkerRegistration | undefined
  >(undefined);

  useEffect(() => {
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined =
      undefined;
    if ('serviceWorker' in navigator) {
      setServiceWorker(null);
      navigator.serviceWorker
        .register('/weblab2_project_service_worker.js')
        .then(registration => {
          if (registration.active) {
            setServiceWorker(registration.active);
          }
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  // If we get a message that we have a new active service worker, update our reference.
                  setServiceWorker(installingWorker);
                }
              });
            }
          });
          serviceWorkerRegistration = registration;
          setServiceWorkerRegistration(registration);
        });
    } else {
      console.error('Service workers are not supported in this browser.');
    }
    return () => {
      serviceWorkerRegistration?.unregister();
    };
  }, []);

  // Send source data to service worker when it changes.
  useEffect(() => {
    if (serviceWorker && source) {
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
          // Right now only images are handled via URL
          url = file.url;
          mimeType = `image/${file.name.split('.').pop()?.toLowerCase()}`;
        } else if (file.language === 'html') {
          mimeType = 'text/html';
          // Process HTML files to add base tag
          const parser = new DOMParser();
          const doc = parser.parseFromString(file.contents, 'text/html');
          const urlSuffix = folder ? `${folder}/` : '';
          addBaseTagToDocument(doc, `${window.location.origin}/${urlSuffix}`);
          content = doc.documentElement.outerHTML;
        } else if (file.language === 'css') {
          mimeType = 'text/css';
        } else if (file.language === 'js') {
          mimeType = 'application/javascript';
        }

        filesData[fullFileName] = {content, mimeType, url};
      });

      // Send files data to service worker along with Content Security Policy (CSP) policy for image sources.
      serviceWorker.postMessage({
        type: ProjectServiceWorkerMessageType.UPDATE_FILES,
        files: filesData,
        cspImageSrc: generateImageSrcCSPPolicy(),
      });
    }
  }, [serviceWorker, source]);

  // Send an intermittent keep-alive message to the service worker to ensure it stays active.
  useEffect(() => {
    if (!serviceWorker) {
      return;
    }

    const intervalId = setInterval(() => {
      serviceWorker.postMessage({
        type: ProjectServiceWorkerMessageType.KEEP_ALIVE,
      });
    }, 15000); // every 15 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [serviceWorker]);

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

  return {serviceWorkerRegistration};
}

export default useProjectServiceWorker;
