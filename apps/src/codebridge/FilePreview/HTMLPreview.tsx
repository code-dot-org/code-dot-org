import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LifecycleEvent} from '@cdo/apps/lab2/utils';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {IframeMessageType, DEFAULT_START_HTML_FILE} from './constants';
import {UrlBar} from './UrlBar';

import moduleStyles from './styles/html-preview.module.scss';

const URL_CHANGE_DELAY_MS = 300;
const SOURCE_CHANGE_DELAY_MS = 500;

export const HTMLPreview = () => {
  const {levelProperties} = useCodebridgeContext();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewUrl = useMemo(() => {
    const re = /([-.]?studio)?\.?(cdn-)?code.org/i;
    const environmentKey = location.hostname.replace(re, '');
    const subdomain = environmentKey.length > 0 ? `${environmentKey}.` : '';
    const port = 'localhost' === environmentKey ? `:${location.port}` : '';
    return `${location.protocol}//preview.${subdomain}codeprojects.org${port}`;
  }, []);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [navigationHistoryIndex, setNavigationHistoryIndex] = useState(-1);

  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  );
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [debouncedSource, setDebouncedSource] = useState(source);
  const sourceLevelId = useRef<number | undefined>(undefined);
  const [isLevelLoading, setIsLevelLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>(
    DEFAULT_START_HTML_FILE
  );
  const isPredictLevel = levelProperties?.predictSettings?.isPredictLevel;
  const hasSubmittedPredictResponse = useAppSelector(
    isPredictResponseSubmitted
  );
  const allowUserScripts = !isPredictLevel || hasSubmittedPredictResponse;
  const canNavigateBack = navigationHistoryIndex > 0;
  const canNavigateForward =
    navigationHistoryIndex < navigationHistory.length - 1;

  const onNavigateBack = () => {
    if (!canNavigateBack) {
      return;
    }
    const updatedFile = navigationHistory[navigationHistoryIndex - 1];
    setNavigationHistoryIndex(navigationHistoryIndex - 1);
    setCurrentFile(updatedFile);
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessageType.NAVIGATE_TO_FILE, fileName: updatedFile},
      previewUrl
    );
  };
  const onNavigateForward = () => {
    if (!canNavigateForward) {
      return;
    }
    const updatedFile = navigationHistory[navigationHistoryIndex + 1];
    setNavigationHistoryIndex(navigationHistoryIndex + 1);
    setCurrentFile(updatedFile);
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessageType.NAVIGATE_TO_FILE, fileName: updatedFile},
      previewUrl
    );
  };

  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    // When we switch levels, clear the source so the preview does not show outdated content.
    setDebouncedSource(undefined);
    setIsLevelLoading(true);
    setCurrentFile(DEFAULT_START_HTML_FILE);
  });

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setIsLevelLoading(false);
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== previewUrl) {
        return;
      }
      if (event.data.type === IframeMessageType.IFRAME_READY) {
        setIsIframeLoaded(true);
        iframeRef.current?.contentWindow?.postMessage(
          {type: IframeMessageType.CHANGE_FILE_URL_BAR, fileName: currentFile},
          previewUrl
        );
      } else if (
        event.data.type === IframeMessageType.FILE_UPDATED &&
        event.origin === previewUrl
      ) {
        setCurrentFile(event.data.fileName);
      } else if (
        event.data.type === IframeMessageType.ADD_FILE_TO_NAVIGATION_HISTORY &&
        event.origin === previewUrl
      ) {
        // If navigationHistoryIndex is the last index, add the file to the end of the array.
        // Otherwise, truncate the array after the current index and add the file to the end.
        const updatedNavigationHistory =
          navigationHistoryIndex === navigationHistory.length - 1
            ? [...navigationHistory, event.data.fileToAddToNavigationHistory]
            : [
                ...navigationHistory.slice(0, navigationHistoryIndex + 1),
                event.data.fileToAddToNavigationHistory,
              ];

        setNavigationHistory(updatedNavigationHistory);
        setNavigationHistoryIndex(updatedNavigationHistory.length - 1);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [previewUrl, currentFile, navigationHistory, navigationHistoryIndex]);

  useEffect(() => {
    const debouncedUpdate = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        {type: IframeMessageType.CHANGE_FILE_URL_BAR, fileName: currentFile},
        previewUrl
      );
    }, URL_CHANGE_DELAY_MS);

    return () => clearTimeout(debouncedUpdate);
  }, [currentFile, previewUrl]);

  useEffect(() => {
    if (isLevelLoading) {
      // If the level is currently loading, we skip sending a potentially outdated source.
      return;
    }
    if (sourceLevelId.current !== levelProperties.id) {
      // If we have a new level id, update the source immediately.
      setDebouncedSource(source);
      setNavigationHistory([]);
      setNavigationHistoryIndex(-1);
      sourceLevelId.current = levelProperties.id;
    } else {
      // Set a timeout to send the debounced value after 500ms
      const debouncedSourceSetter = setTimeout(() => {
        setDebouncedSource(source);
      }, SOURCE_CHANGE_DELAY_MS);

      // Cleanup the timeout if source or level changes before 500ms has elapsed.
      return () => {
        clearTimeout(debouncedSourceSetter);
      };
    }
  }, [source, levelProperties.id, isLevelLoading]);

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

  // Keep inner preview's script permission in sync with predict level state.
  useEffect(() => {
    if (isIframeLoaded && iframeRef.current && previewUrl) {
      iframeRef.current.contentWindow?.postMessage(
        {type: IframeMessageType.SET_ALLOW_SCRIPTS, allow: allowUserScripts},
        previewUrl
      );
    }
  }, [isIframeLoaded, previewUrl, allowUserScripts]);

  return (
    <PanelContainer
      id={'html-preview'}
      headerContent={codebridgeI18n.preview()}
      hideHeaders
    >
      <div className={moduleStyles.previewContainer}>
        <UrlBar
          value={currentFile}
          onChange={setCurrentFile}
          canNavigateBack={canNavigateBack}
          canNavigateForward={canNavigateForward}
          onNavigateBack={onNavigateBack}
          onNavigateForward={onNavigateForward}
        />
        {/* This iframe points to the environment-specific version of preview.codeprojects.org. That url will eventually
            route to InnerHTMLPreview. */}
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
    </PanelContainer>
  );
};
