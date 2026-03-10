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
  const [parameters, setParameters] = React.useState<object | undefined>(
    undefined
  );
  const [currentFile, setCurrentFile] = React.useState<string | undefined>(
    undefined
  );
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  // True once we've made a warmup fetch to the Service Worker immediately before showing the iframe.
  // Safari aggressively idles SWs; if the SW is idle when the iframe navigate happens,
  // Safari won't intercept it. The warmup fetch ensures the SW is awake.
  const [swWarmedUp, setSwWarmedUp] = useState(false);
  // Key to indicate we should re-warmup the SW on source changes.
  const [previewKey, setPreviewKey] = useState(0);
  // Numerical key used to force a re-render of the iframe when we need to refresh the iframe, such as
  // when toggling script permissions or when the source document (or a dependent file) is updated.
  const [renderKey, setRenderKey] = useState(0);
  const [allowScripts, setAllowScripts] = useState(false);
  const [isLevelLoading, setIsLevelLoading] = useState(false);

  const parentOrigin = useMemo(() => {
    const regex = /[^.]+\.preview\.([^.]+)\.codeprojects\.org/;
    const match = location.hostname.match(regex);
    const environment = match && match[1] ? `${match[1]}-` : '';
    const port =
      'localhost-' === environment && location.port ? `:${location.port}` : '';
    const cdn = environment.includes('adhoc') ? 'cdn-' : '';
    return `${location.protocol}//${environment}studio.${cdn}code.org${port}`;
  }, []);

  const {serviceWorkerRegistration, serviceWorkerUnavailable} =
    useProjectServiceWorker(source, parentOrigin, allowScripts, parameters);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // We either receive messages from ourselves (for file changes via href) or from the parent.
      if (event.origin !== parentOrigin && event.origin !== location.origin) {
        return;
      }
      const {data} = event;
      if (data.type === IframeMessageType.SET_SOURCE) {
        setSource(data.source);
        setParameters(data.parameters);
      } else if (data.type === IframeMessageType.CHANGE_FILE_URL_BAR) {
        setCurrentFile(data.fileName);
      } else if (data.type === IframeMessageType.SET_ALLOW_SCRIPTS) {
        setAllowScripts(!!data.allow);
        setPreviewKey(prevKey => prevKey + 1);
      } else if (data.type === IframeMessageType.REFRESH) {
        setPreviewKey(prevKey => prevKey + 1);
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
    if (serviceWorkerUnavailable) {
      window.parent.postMessage(
        {
          type: IframeMessageType.SERVICE_WORKER_UNAVAILABLE,
        },
        parentOrigin
      );
    }
  }, [serviceWorkerUnavailable, parentOrigin]);

  useEffect(() => {
    window.addEventListener('unload', () => {
      // Ensure the service worker is unregistered when we unload
      serviceWorkerRegistration?.unregister();
    });
  }, [serviceWorkerRegistration]);

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
        setPreviewKey(prevKey => prevKey + 1);
        setServiceWorkerReady(true);
      } else if (
        event.data.type === ProjectServiceWorkerMessageType.NETWORK_REQUEST
      ) {
        window.parent.postMessage(
          {
            type: IframeMessageType.NETWORK_REQUEST,
            request: event.data.requestData,
          },
          parentOrigin
        );
      } else if (
        event.data.type === ProjectServiceWorkerMessageType.NETWORK_RESPONSE
      ) {
        window.parent.postMessage(
          {
            type: IframeMessageType.NETWORK_RESPONSE,
            response: event.data.responseData,
          },
          parentOrigin
        );
      } else if (
        event.data.type === ProjectServiceWorkerMessageType.CONSOLE_LOG
      ) {
        window.parent.postMessage(
          {
            type: IframeMessageType.CONSOLE_LOG,
            level: event.data.level,
            args: event.data.args,
          },
          parentOrigin
        );
      }
    };
    return () => {
      broadcastChannel.close();
    };
  }, [parentOrigin]);

  // Warm up the Service Worker before the iframe navigates. We fetch the current file from
  // InnerHTMLPreview (a controlled SW client) to ensure the SW is awake immediately
  // before the iframe src is set.
  // This prevents issues on Safari where the Service Worker won't respond to the iframe navigation.
  useEffect(() => {
    if (!serviceWorkerReady || !currentFile || isLevelLoading) {
      setSwWarmedUp(false);
      return;
    }
    let cancelled = false;
    setSwWarmedUp(false);
    fetch(`${window.location.origin}/${currentFile}`)
      .catch(() => {
        // Swallow fetch errors to avoid unhandled promise rejections during Service Worker warmup.
      })
      .finally(() => {
        if (!cancelled) {
          setSwWarmedUp(true);
          setRenderKey(prevKey => prevKey + 1);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serviceWorkerReady, isLevelLoading, previewKey, currentFile]);

  const getPreview = useCallback(() => {
    if (swWarmedUp && currentFile && !isLevelLoading) {
      return (
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="self"
          title="Inner HTML Preview"
          id="inner-preview"
          key={renderKey} // This forces a re-render when renderKey changes.
          src={`${window.location.origin}/${currentFile}`}
          className={moduleStyles.fileIframe}
        />
      );
    } else if (serviceWorkerUnavailable) {
      return (
        <div className={moduleStyles.placeholderContainer}>
          <CodebridgeEmptyState
            title="Preview Unavailable"
            description="We're sorry, the preview is unavailable in your browser. Please contact support@code.org for assistance."
          />
        </div>
      );
    } else {
      return (
        <div className={moduleStyles.placeholderContainer}>
          <CodebridgeEmptyState title="Loading..." />
        </div>
      );
    }
  }, [
    swWarmedUp,
    currentFile,
    isLevelLoading,
    serviceWorkerUnavailable,
    renderKey,
  ]);

  return getPreview();
};

export default InnerHTMLPreview;
