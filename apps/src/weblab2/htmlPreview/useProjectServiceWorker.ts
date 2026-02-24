import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFolderPath} from '@codebridge/utils';
import {useEffect, useMemo, useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

import {ProjectServiceWorkerMessageType} from './constants';
import {generateContentSecurityPolicyForPreview} from './contentSecurityPolicyHelper';
import {
  addBaseTagToDocument,
  addConsoleOverrideToDocument,
  addCSPViolationListenerToDocument,
} from './htmlParsingHelpers';

// Hook that handles registering and communicating with the project service worker.
function useProjectServiceWorker(
  source: MultiFileSource | undefined,
  codeStudioUrl: string
) {
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(
    null
  );
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<
    ServiceWorkerRegistration | undefined
  >(undefined);
  const [serviceWorkerUnavailable, setServiceWorkerUnavailable] =
    useState<boolean>(false);

  const contentSecurityPolicy = useMemo(
    () => generateContentSecurityPolicyForPreview(codeStudioUrl),
    [codeStudioUrl]
  );

  useEffect(() => {
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined =
      undefined;
    if ('serviceWorker' in navigator) {
      setServiceWorker(null);
      setServiceWorkerUnavailable(false);
      navigator.serviceWorker
        .register('/weblab2_project_service_worker.js')
        .then(registration => {
          if (registration.active) {
            console.log(
              'setting active service worker, navigator.serviceWorker.controller:',
              navigator.serviceWorker.controller
            );
            setServiceWorker(registration.active);
          }
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'activated') {
                  console.log(
                    'Service worker activated and ready to receive messages'
                  );
                  // Wait for the service worker to be fully activated (and call clients.claim())
                  // before updating our reference. Safari requires the worker to be controlling
                  // the page before it will intercept fetch requests from iframes.
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
      setServiceWorkerUnavailable(true);
    }
    return () => {
      serviceWorkerRegistration?.unregister();
    };
  }, []);

  // Send source data to service worker when it changes.
  useEffect(() => {
    if (serviceWorker && source && contentSecurityPolicy) {
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

        const fileExt = getFileExtension(file.name);
        if (file.url) {
          // Right now only images are handled via URL
          url = file.url;
          mimeType = `image/${fileExt}`;
        } else if (fileExt === 'html') {
          mimeType = 'text/html';
          // Process HTML files to add base tag
          const parser = new DOMParser();
          const doc = parser.parseFromString(file.contents, 'text/html');
          const urlSuffix = folder ? `${folder}/` : '';
          addBaseTagToDocument(doc, `${window.location.origin}/${urlSuffix}`);
          addConsoleOverrideToDocument(doc);
          addCSPViolationListenerToDocument(doc);
          content = doc.documentElement.outerHTML;
        } else if (fileExt === 'css') {
          mimeType = 'text/css';
        } else if (fileExt === 'js') {
          mimeType = 'application/javascript';
        }

        filesData[fullFileName] = {content, mimeType, url};
      });
      console.log('Sending file update to service worker');
      // Send files data to service worker
      serviceWorker.postMessage({
        type: ProjectServiceWorkerMessageType.UPDATE_FILES,
        files: filesData,
        contentSecurityPolicy,
      });
    }
  }, [contentSecurityPolicy, serviceWorker, source]);

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

  return {serviceWorkerRegistration, serviceWorkerUnavailable};
}

export default useProjectServiceWorker;
