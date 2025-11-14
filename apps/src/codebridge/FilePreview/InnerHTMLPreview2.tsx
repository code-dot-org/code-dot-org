import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {
  IframeMessageType,
  PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL,
  ProjectServiceWorkerMessageType,
} from './constants';
import useProjectServiceWorker from './useProjectServiceWorker';

import moduleStyles from './styles/inner-html-preview.module.scss';

// Previewer for student code that utilizes a service worker to serve project files.
// This allows us to handle linking between files within the project without hacking links in
// the HTML, which is fragile and doesn't work for links set via JavaScript.
const InnerHTMLPreview = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [source, setSource] = React.useState<MultiFileSource | undefined>(
    undefined
  );
  const [currentFile, setCurrentFile] = React.useState<string | undefined>(
    undefined
  );
  // Numerical key used to trigger iframe reloads when we have updates.
  const [previewKey, setPreviewKey] = useState(0);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  useProjectServiceWorker(source);
  const [allowScripts, setAllowScripts] = useState(false);
  const [isLevelLoading, setIsLevelLoading] = useState(false);

  const parentOrigin = useMemo(() => {
    const regex = /[^.]+\.preview\.([^.]+)\.codeprojects\.org/;
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
        setSource(data.source);
      } else if (data.type === IframeMessageType.CHANGE_FILE_URL_BAR) {
        setCurrentFile(data.fileName);
      } else if (data.type === IframeMessageType.SET_ALLOW_SCRIPTS) {
        setAllowScripts(!!data.allow);
      } else if (data.type === IframeMessageType.REFRESH) {
        iframeRef.current?.contentWindow?.location.reload();
      } else if (data.type === IframeMessageType.LEVEL_LOADING) {
        setIsLevelLoading(data.isLoading);
        if (data.isLoading) {
          // If we are loading, mark service worker as not ready to prevent trying to preview too early.
          setServiceWorkerReady(false);
        }
      }
    },
    [parentOrigin]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    console.log('iframe_ready', parentOrigin);
    // Notify parent that we're ready to receive messages
    window.parent.postMessage(
      {type: IframeMessageType.IFRAME_READY},
      parentOrigin
    );

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage, parentOrigin]);

  useEffect(() => {
    // Set up a broadcast channel to receive messages from the service worker.
    const broadcastChannel = new BroadcastChannel(
      PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL
    );
    broadcastChannel.onmessage = event => {
      if (
        event.data.type === ProjectServiceWorkerMessageType.SERVING_HTML_FILE
      ) {
        const filePath = event.data.filePath;
        setCurrentFile(filePath);
        // Notify parent of the file change
        window.parent.postMessage(
          {type: IframeMessageType.FILE_UPDATED, fileName: filePath},
          parentOrigin
        );
      } else if (
        event.data.type === ProjectServiceWorkerMessageType.RECEIVED_SOURCE
      ) {
        setServiceWorkerReady(true);
        setPreviewKey(prevKey => prevKey + 1);
      }
    };
    return () => {
      broadcastChannel.close();
    };
  }, [parentOrigin]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.location.reload();
    }
  }, [previewKey]);

  const getPreview = useCallback(() => {
    if (serviceWorkerReady && currentFile && !isLevelLoading) {
      return (
        <iframe
          ref={iframeRef}
          sandbox={`${allowScripts ? 'allow-scripts ' : ''}allow-same-origin`}
          allow="self"
          title="Inner HTML Preview"
          id="inner-preview"
          key={allowScripts ? 1 : 0} // This forces a re-render when allowScripts changes.
          src={`${window.location.origin}/${currentFile}`}
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
  }, [allowScripts, currentFile, isLevelLoading, serviceWorkerReady]);

  return getPreview();
};

export default InnerHTMLPreview;
