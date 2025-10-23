import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {setIsFullScreenView} from '@cdo/apps/lab2/lab2Redux';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {getLabViewPageAction, LifecycleEvent} from '@cdo/apps/lab2/utils';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  IframeMessageType,
  PreviewViewMode,
  DEFAULT_START_HTML_FILE,
} from './constants';
import {HTMLPreviewHeader} from './HTMLPreviewHeader';

import moduleStyles from './styles/html-preview.module.scss';

const URL_CHANGE_DELAY_MS = 300;
const SOURCE_CHANGE_DELAY_MS = 500;

export const HTMLPreview: React.FC = () => {
  const pageAction = getLabViewPageAction();
  const isFullScreenView = useAppSelector(state => state.lab.isFullScreenView);
  const iframeHeightClass = useMemo(() => {
    if (pageAction === 'share' || isFullScreenView) {
      return moduleStyles.fullScreenPreviewIframeHeight;
    }
    return moduleStyles.levelViewPreviewIframeHeight;
  }, [pageAction, isFullScreenView]);
  const {levelProperties} = useCodebridgeContext();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
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
  const [inputValue, setInputValue] = useState<string>(DEFAULT_START_HTML_FILE);
  const [currentFile, setCurrentFile] = useState<string>(
    DEFAULT_START_HTML_FILE
  );
  const [previewViewMode, setPreviewViewMode] = useState<PreviewViewMode>(
    PreviewViewMode.DESKTOP
  );
  const isPredictLevel = levelProperties?.predictSettings?.isPredictLevel;
  const hasSubmittedPredictResponse = useAppSelector(
    isPredictResponseSubmitted
  );
  const allowUserScripts = !isPredictLevel || hasSubmittedPredictResponse;
  const canNavigateBack = navigationHistoryIndex > 0;
  const canNavigateForward =
    navigationHistoryIndex < navigationHistory.length - 1;

  const dispatch = useAppDispatch();

  const handleUrlSubmit = (newInputValue: string) => {
    setCurrentFile(newInputValue);
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessageType.CHANGE_FILE_URL_BAR, fileName: newInputValue},
      previewUrl
    );
    // Focus the iframe after submitting the URL
    if (isIframeLoaded && iframeRef.current) {
      previewContainerRef.current?.focus();
    }
    addToNavigationHistory(
      newInputValue,
      navigationHistoryIndex,
      navigationHistory
    );
  };

  const onNavigateBack = () => {
    if (!canNavigateBack) {
      return;
    }
    const updatedFile = navigationHistory[navigationHistoryIndex - 1];
    setNavigationHistoryIndex(navigationHistoryIndex - 1);
    setCurrentFile(updatedFile);
    setInputValue(updatedFile);
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessageType.CHANGE_FILE_URL_BAR, fileName: updatedFile},
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
    setInputValue(updatedFile);
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessageType.CHANGE_FILE_URL_BAR, fileName: updatedFile},
      previewUrl
    );
  };

  const toggleFullScreen = () => {
    dispatch(setIsFullScreenView(!isFullScreenView));
  };

  const addToNavigationHistory = (
    filePath: string,
    navigationHistoryIndex: number,
    navigationHistory: string[]
  ) => {
    // Only add filePath to navigation history if it is not already in history at the current index.
    const addToNavHistory =
      filePath !== navigationHistory[navigationHistoryIndex];
    // If navigationHistoryIndex is the last index, add filePath to the end of the array.
    // Otherwise, truncate the array after the current index and then add filePath to the end.
    if (addToNavHistory) {
      const updatedNavigationHistory =
        navigationHistoryIndex === navigationHistory.length - 1
          ? [...navigationHistory, filePath]
          : [
              ...navigationHistory.slice(0, navigationHistoryIndex + 1),
              filePath,
            ];
      setNavigationHistory(updatedNavigationHistory);
      setNavigationHistoryIndex(updatedNavigationHistory.length - 1);
    }
  };

  const onRefresh = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessageType.REFRESH},
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

  // Update inputValue when currentFile changes (for navigation buttons)
  useEffect(() => {
    setInputValue(currentFile);
  }, [currentFile]);

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
        setInputValue(event.data.fileName);
        addToNavigationHistory(
          event.data.fileName,
          navigationHistoryIndex,
          navigationHistory
        );
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
      sourceLevelId.current = levelProperties.id;
      setCurrentFile(DEFAULT_START_HTML_FILE);
      setInputValue(DEFAULT_START_HTML_FILE);
      setNavigationHistory([DEFAULT_START_HTML_FILE]);
      setNavigationHistoryIndex(0);
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
      <div
        className={classNames(
          moduleStyles.previewContainer,
          isFullScreenView && moduleStyles.fullScreenPreviewContainer
        )}
      >
        <HTMLPreviewHeader
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleUrlSubmit}
          canNavigateBack={canNavigateBack}
          canNavigateForward={canNavigateForward}
          onNavigateBack={onNavigateBack}
          onNavigateForward={onNavigateForward}
          onRefresh={onRefresh}
          onToggleFullScreen={toggleFullScreen}
          previewViewMode={previewViewMode}
          setPreviewViewMode={setPreviewViewMode}
        />
        {/* This iframe points to the environment-specific version of preview.codeprojects.org. That url will eventually
            route to InnerHTMLPreview. */}
        <div
          ref={previewContainerRef}
          // This provides a small visual indicator when the iframe is focused after submitting the URL.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={moduleStyles.previewWrapper}
          role="application"
          aria-label="Web Preview Frame"
        >
          <iframe
            sandbox="allow-scripts allow-same-origin"
            allow="self"
            title="Web Preview"
            ref={iframeRef}
            id="preview"
            className={classNames(
              moduleStyles.previewIframe,
              iframeHeightClass,
              previewViewMode === PreviewViewMode.DESKTOP
                ? moduleStyles.desktopPreviewIframe
                : moduleStyles.mobilePreviewIframe
            )}
            src={previewUrl}
          />
        </div>
      </div>
    </PanelContainer>
  );
};
