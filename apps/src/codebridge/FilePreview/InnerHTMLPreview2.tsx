import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {CodebridgeEmptyState} from '../components/CodebridgeEmptyState';

import {
  IframeMessageType,
  PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL,
  ProjectServiceWorkerMessageType,
} from './constants';
import useProjectServiceWorker from './useProjectServiceWorker';

import moduleStyles from './styles/inner-html-preview.module.scss';

const InnerHTMLPreview = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [source, setSource] = React.useState<MultiFileSource | undefined>(
    undefined
  );
  const [currentFile, setCurrentFile] = React.useState<string | undefined>(
    undefined
  );
  const [previewKeyIndex, setPreviewKeyIndex] = useState(0);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  useProjectServiceWorker(source, currentFile);
  const [allowScripts, setAllowScripts] = useState(false);
  const [isLevelLoading, setIsLevelLoading] = useState(false);

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
          // todo: do we need to do this?
          setSource(undefined);
        } else {
          setSource(data.source);
        }
      } else if (data.type === IframeMessageType.CHANGE_FILE_URL_BAR) {
        setCurrentFile(data.fileName);
        // We don't need to update the parent, because they initiated this change.
      } else if (data.type === IframeMessageType.SET_ALLOW_SCRIPTS) {
        setAllowScripts(!!data.allow);
      } else if (data.type === IframeMessageType.REFRESH) {
        iframeRef.current?.contentWindow?.location.reload();
      } else if (data.type === IframeMessageType.LEVEL_LOADING) {
        setIsLevelLoading(data.isLoading);
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

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel(
      PROJECT_SERVICE_WORKER_BROADCAST_CHANNEL
    );
    broadcastChannel.onmessage = event => {
      if (
        event.data.type === ProjectServiceWorkerMessageType.SERVING_HTML_FILE
      ) {
        const filePath = event.data.filePath;
        setCurrentFile(filePath);
        console.log('Notifying parent of HTML file change:', filePath);
        // Notify parent of the file change
        window.parent.postMessage(
          {type: IframeMessageType.FILE_UPDATED, fileName: filePath},
          parentOrigin
        );
      } else if (
        event.data.type === ProjectServiceWorkerMessageType.RECEIVED_SOURCE
      ) {
        console.log('Received source acknowledged by service worker');
        setServiceWorkerReady(true);
        setPreviewKeyIndex(prevIndex => prevIndex + 1);
      } else if (
        event.data.type === ProjectServiceWorkerMessageType.UPDATED_CURRENT_FILE
      ) {
        console.log('Service worker confirmed current file update');
        setPreviewKeyIndex(prevIndex => prevIndex + 1);
      } else {
        console.log('Unknown message from service worker:', event.data);
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
  }, [previewKeyIndex]);

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
