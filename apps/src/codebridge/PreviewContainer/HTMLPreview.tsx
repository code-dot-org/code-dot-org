import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  ProjectFile,
  KeyedFileRecord,
  KeyedFolderRecord,
} from '@codebridge/types';
import {
  findFolder,
  getFullFilePath,
  registerServiceWorker,
} from '@codebridge/utils';
import React, {useRef, useMemo, useEffect} from 'react';

type HTMLPreviewProps = {
  file: ProjectFile;
};

const getMappedFiles = (files: KeyedFileRecord, folders: KeyedFolderRecord) =>
  Object.values(files).reduce(
    (bucket, file) => ({
      ...bucket,
      [getFullFilePath(file, folders)]: file,
    }),
    {}
  );

export const HTMLPreview = ({file}: HTMLPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const serviceWorker = useRef<ServiceWorkerRegistration>();

  const {
    project: {files, folders},
  } = useCodebridgeContext();

  useEffect(() => {
    console.log('UE1');
    const asyncRegisterServiceWorker = async () => {
      console.log('GONNA ATTEMPT');
      const worker =
        (await registerServiceWorker()) as ServiceWorkerRegistration;
      if (!worker) {
        console.log('FAILED TO GET WORKER');
        return;
      }
      console.log('GOT WORKER : ', worker);
      serviceWorker.current = worker;
      const mappedFiles = getMappedFiles(files, folders);
      console.log('M1');
      serviceWorker?.current?.active?.postMessage(mappedFiles);
      iframeRef.current?.contentWindow?.location?.reload();
    };
    asyncRegisterServiceWorker();

    return () => {
      if (serviceWorker.current) {
        console.log('UNREGISTERS');
        serviceWorker.current.unregister();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mappedFiles = getMappedFiles(files, folders);
    console.log('should fire message');
    console.log('MF : ', mappedFiles);
    console.log('RELOAD');
    serviceWorker?.current?.active?.postMessage(mappedFiles);
    iframeRef.current?.contentWindow?.location?.reload();
  }, [files, folders]);

  const srcdoc = useMemo(() => {
    if (!file) {
      return '';
    }

    const contents = file.contents.replace(
      new RegExp('<link rel="stylesheet" href="([^"]+)"\\s*/>', 'g'),
      (_: unknown, styleURI: string) => {
        // this is tedious. Break apart the style URI and look up all folders to get the final folder ID.
        // THEN look for a file with the same name and folder and that's what we need.

        const styleFolders = styleURI.split('/');
        const styleName = styleFolders.pop();

        const folderId = findFolder(styleFolders, {
          folders: Object.values(folders),
        });

        const styleFile = Object.values(files).find(
          f => f.name === styleName && f.folderId === folderId
        );

        return `
          <style>
            ${styleFile?.contents}
          </style>
      `;
      }
    );

    return contents;
  }, [files, folders, file]);

  return (
    <>
      {file && (
        <iframe
          //sandbox=""
          allow="self"
          title="Web Preview"
          ref={iframeRef}
          id="preview"
          style={{width: '100%', height: '100%', backgroundColor: 'white'}}
          srcDoc={srcdoc}
        />
      )}
    </>
  );
};
