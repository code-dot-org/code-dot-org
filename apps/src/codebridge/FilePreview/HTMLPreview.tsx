import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LifecycleEvent} from '@cdo/apps/lab2/utils';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {IframeMessageType} from './constants';
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
  const [currentFile, setCurrentFile] = useState<string>('index.html');
  const isPredictLevel = levelProperties?.predictSettings?.isPredictLevel;
  const hasSubmittedPredictResponse = useAppSelector(
    isPredictResponseSubmitted
  );
  const allowUserScripts = !isPredictLevel || hasSubmittedPredictResponse;
  console.log('navigationHistoryIndex in HTMLPreview', navigationHistoryIndex);
  console.log('navigationHistory in HTMLPreview', navigationHistory);
  const canNavigateBack = navigationHistoryIndex > 0;
  console.log('canNavigateBack in HTMLPreview', canNavigateBack);
  const canNavigateForward =
    navigationHistoryIndex < navigationHistory.length - 1;
  console.log('canNavigateForward in HTMLPreview', canNavigateForward);

  const onNavigateBack = () => {
    console.log(
      'onNavigateBack in HTMLPreview - navigationHistoryIndex',
      navigationHistoryIndex
    );
    if (!canNavigateBack) {
      return;
    }
    const updatedFile = navigationHistory[navigationHistoryIndex - 1];
    console.log('navigationHistoryIndex before navigateBack', navigationHistoryIndex);
    setNavigationHistoryIndex(navigationHistoryIndex - 1);
    console.log('navigationHistoryIndex after navigateBack', navigationHistoryIndex);
    setCurrentFile(updatedFile);
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessageType.NAVIGATE_TO_FILE, fileName: updatedFile},
      previewUrl
    );
  };
  const onNavigateForward = () => {
    console.log(
      'onNavigateForward in HTMLPreview - navigationHistoryIndex',
      navigationHistoryIndex
    );
    if (!canNavigateForward) {
      return;
    }
    const updatedFile = navigationHistory[navigationHistoryIndex + 1];
    console.log('navigationHistoryIndex before navigateForward', navigationHistoryIndex);
    setNavigationHistoryIndex(navigationHistoryIndex + 1);
    console.log('navigationHistoryIndex after navigateForward', navigationHistoryIndex);
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
      } else if (event.data.type === IframeMessageType.FILE_UPDATED) {
        setCurrentFile(event.data.fileName);
      } else if (
        event.data.type === IframeMessageType.ADD_FILE_TO_NAVIGATION_HISTORY
      ) {
        console.log('ADD_FILE_TO_NAVIGATION_HISTORY in HTMLPreview');
        // if navigationHistoryIndex is the last index, add the file to the end of the array
        // else truncate the array after the current index and add the file to the end
        if (navigationHistoryIndex === navigationHistory.length - 1) {
          const updatedNavigationHistory = [
            ...navigationHistory,
            event.data.fileToAddToNavigationHistory,
          ];
          setNavigationHistory(updatedNavigationHistory);
          setNavigationHistoryIndex(updatedNavigationHistory.length - 1);
        } else {
          const updatedNavigationHistory = [
            ...navigationHistory.slice(0, navigationHistoryIndex + 1),
            event.data.fileToAddToNavigationHistory,
          ];
          setNavigationHistory(updatedNavigationHistory);
          setNavigationHistoryIndex(updatedNavigationHistory.length - 1);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [previewUrl, currentFile, navigationHistory, navigationHistoryIndex]);

  useEffect(() => {
    const debouncedUpdate = setTimeout(() => {
      console.log('debouncedUpdate in HTMLPreview', currentFile);
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

  console.log('currentFile in HTMLPreview', currentFile);
  console.log('navigationHistory in HTMLPreview', navigationHistory);
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
