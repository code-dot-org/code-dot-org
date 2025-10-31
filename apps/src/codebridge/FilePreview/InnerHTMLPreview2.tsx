import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';

import {CodebridgeEmptyState} from '../components/CodebridgeEmptyState';

import {IframeMessageType} from './constants';
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
  const {serviceWorkerReady} = useProjectServiceWorker(source, currentFile);
  const [allowScripts, setAllowScripts] = useState(false);

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
    if (serviceWorkerReady && currentFile) {
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
  }, [allowScripts, currentFile, serviceWorkerReady]);

  return getPreview();
};

export default InnerHTMLPreview;
