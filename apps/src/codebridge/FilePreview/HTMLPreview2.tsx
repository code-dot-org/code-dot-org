import TextField from '@code-dot-org/component-library/textField';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent} from '@cdo/apps/lab2/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';

import {IframeMessageType} from './constants';

import moduleStyles from './styles/html-preview2.module.scss';

// TODO: do we want a way for users to change the file manually?
// We could set that up fairly easily since we control the file changes here.
// We could also track the list of viewed files and implement history (back/forwards) at some point.
// We could also implement a fake url bar that shows the current file name and allows users to change it.
export const HTMLPreview2 = () => {
  const {levelProperties} = useCodebridgeContext();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewUrl = useMemo(() => {
    const re = /([-.]?studio)?\.?(cdn-)?code.org/i;
    const environmentKey = location.hostname.replace(re, '');
    const subdomain = environmentKey.length > 0 ? `${environmentKey}.` : '';
    const port = 'localhost' === environmentKey ? `:${location.port}` : '';
    return `${location.protocol}//preview.${subdomain}codeprojects.org${port}`;
  }, []);

  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  );
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [debouncedSource, setDebouncedSource] = useState(source);
  const sourceLevelId = useRef<number | undefined>(undefined);
  const [levelLoading, setLevelLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>('index.html');

  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    // Clear the source so the preview does not show outdated content.
    setDebouncedSource(undefined);
    setLevelLoading(true);
  });

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setLevelLoading(false);
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== previewUrl) {
        return;
      }
      if (event.data.type === IframeMessageType.IFRAME_READY) {
        setIsIframeLoaded(true);
        // We will change the file to index.html before the source has been set.
        // Right now it's not a problem but it does put an error in the console.
        // Should the inner preview default to index.html?
        // Or should we wait for the source to be set before changing the file?
        iframeRef.current?.contentWindow?.postMessage(
          {type: IframeMessageType.CHANGE_FILE_URL_BAR, fileName: currentFile},
          previewUrl
        );
      } else if (
        event.data.type === IframeMessageType.FILE_UPDATED &&
        event.origin === previewUrl
      ) {
        setCurrentFile(event.data.fileName);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [previewUrl, currentFile]);

  useEffect(() => {
    const debouncedUpdate = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        {type: IframeMessageType.CHANGE_FILE_URL_BAR, fileName: currentFile},
        previewUrl
      );
    }, 300);

    return () => clearTimeout(debouncedUpdate);
  }, [currentFile, previewUrl]);

  useEffect(() => {
    if (levelLoading) {
      // If the level is currently loading, we skip sending a potentially outdated source.
      return;
    }
    if (sourceLevelId.current !== levelProperties.id) {
      // If we have a new level id, update the source immediately.
      setDebouncedSource(source);
      sourceLevelId.current = levelProperties.id;
    } else {
      // Set a timeout to update debounced value after 500ms
      const debouncedSourceSetter = setTimeout(() => {
        setDebouncedSource(source);
      }, 500);

      // Cleanup the timeout if source or level changes before 500ms.
      return () => {
        clearTimeout(debouncedSourceSetter);
      };
    }
  }, [source, levelProperties.id, levelLoading]);

  useEffect(() => {
    if (isIframeLoaded && iframeRef.current && debouncedSource && previewUrl) {
      iframeRef.current.contentWindow?.postMessage(
        {
          type: IframeMessageType.SET_SOURCE,
          source: debouncedSource,
        },
        previewUrl
      );
    }
  }, [previewUrl, debouncedSource, isIframeLoaded]);

  return (
    <div className={moduleStyles.previewContainer}>
      <div>
        <TextField
          onChange={e => setCurrentFile(e.target.value)}
          value={currentFile}
          name={'url-input'}
          size={'s'}
        />
      </div>
      <iframe
        sandbox="allow-scripts allow-same-origin"
        allow="self"
        title="Web Preview"
        ref={iframeRef}
        id="preview"
        className={moduleStyles.previewIframe}
        src={previewUrl}
      />
    </div>
  );
};
