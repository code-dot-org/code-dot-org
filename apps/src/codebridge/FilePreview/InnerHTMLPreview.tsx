import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {createBlobUrlForFile, getFolderPath} from '@codebridge/utils';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {IframeMessageType} from './constants';
import {
  setContentSecurityPolicy,
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
  const [blobUrl, setBlobUrl] = React.useState<string | undefined>(undefined);
  const [filesToBlobs, setFilesToBlobs] = React.useState<
    Record<string, string>
  >({});
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

  // Wrapper around setFilesToBlobs that will revoke the previous blob URLs
  // to prevent memory leaks.
  const revokeAndSetFilesToBlobs = (
    newFilesToBlobs: Record<string, string>
  ) => {
    setFilesToBlobs(prevFilesToBlobs => {
      Object.values(prevFilesToBlobs).forEach(blobUrl =>
        URL.revokeObjectURL(blobUrl)
      );
      return newFilesToBlobs;
    });
  };

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
          revokeAndSetFilesToBlobs({});
          setBlobUrl(undefined);
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
  // Better regeneration logic: https://codedotorg.atlassian.net/browse/CT-1259
  useEffect(() => {
    if (source) {
      const files: Record<string, string> = {};
      // Handle non-HTML files. These are just converted to Blobs.
      Object.values(source.files).forEach(file => {
        if (file.language !== 'html') {
          const fullFileName = getFullyQualifiedFileName(
            file.name,
            file.folderId,
            source.folders
          );
          files[fullFileName] = createBlobUrlForFile(file);
        }
      });
      // Handle HTML files. We do the following;
      // 1. Set the Content Security Policy to allow requests to certain origins.
      // 2. Replace src links to non-html files with blob URLs.
      // 3. Update links to other files with a click handler that will post a message to us
      //    to change the file.
      const htmlFiles = Object.values(source.files).filter(
        file => file.language === 'html'
      );
      htmlFiles.forEach(file => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(file.contents, 'text/html');

        const fullFileName = getFullyQualifiedFileName(
          file.name,
          file.folderId,
          source.folders
        );

        setContentSecurityPolicy(doc);
        updateLinksToNonHtmlFiles(doc, files, fullFileName);
        updateLinksToHtmlFiles(doc, fullFileName);
        const updatedContents = doc.documentElement.outerHTML;
        const blob = new Blob([updatedContents], {type: 'text/html'});
        files[fullFileName] = URL.createObjectURL(blob);
      });
      revokeAndSetFilesToBlobs(files);
    }
  }, [parentOrigin, source]);

  const getPreview = useCallback(() => {
    // TODO: better loading/page not found UI.
    // https://codedotorg.atlassian.net/browse/CT-1258
    if (blobUrl === NOT_FOUND_FILE) {
      return <div>Page not found</div>;
    } else if (blobUrl) {
      return (
        <iframe
          ref={iframeRef}
          sandbox={`${allowScripts ? 'allow-scripts ' : ''}allow-same-origin`}
          allow="self"
          title="Inner HTML Preview"
          id="inner-preview"
          key={allowScripts ? 1 : 0} // This forces a re-render when allowScripts changes.
          src={blobUrl}
          className={moduleStyles.fileIframe}
        />
      );
    } else {
      return <div>Loading...</div>;
    }
  }, [blobUrl, allowScripts]);

  return getPreview();
};

export default InnerHTMLPreview;
