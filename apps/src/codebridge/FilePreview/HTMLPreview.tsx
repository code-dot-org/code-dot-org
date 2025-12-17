import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import classNames from 'classnames';
import {isEqual} from 'lodash';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {setIsFullScreenView} from '@cdo/apps/lab2/lab2Redux';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {LifecycleEvent, sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {filterSourceForPreview} from '../utils/filterSourceForPreview';

import {
  IframeMessageType,
  PreviewViewMode,
  DEFAULT_START_HTML_FILE,
} from './constants';
import {HTMLPreviewHeader} from './HTMLPreviewHeader';
import PreviewEmptyState from './PreviewEmptyState';
import PreviewStopped from './PreviewStopped';

import moduleStyles from './styles/html-preview.module.scss';

const SOURCE_CHANGE_DELAY_MS = 500;

export const HTMLPreview: React.FC = () => {
  const normalizedChannelId = useAppSelector(
    // Make channel id all lower case and remove underscores, as underscores are not valid in domain names,
    // and domain names are case-insensitive.
    state => state.lab.channel?.id?.toLowerCase().replace('_', '') || ''
  );
  const isFullScreenView = useAppSelector(state => state.lab.isFullScreenView);
  const {levelProperties} = useCodebridgeContext();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const previewUrl = useMemo(() => {
    const re = /([-.]?studio)?\.?(cdn-)?code.org/i;
    const environmentKey = location.hostname.replace(re, '');
    const subdomain = environmentKey.length > 0 ? `${environmentKey}.` : '';
    const useLocalPrefixOverride = experiments.isEnabledAllowingQueryString(
      experiments.LOCAL_WEBLAB2_PREVIEW
    );
    const isLocalhost = 'localhost' === environmentKey;
    // When testing on localhost, it can be convenient to have a fixed subdomain
    // to avoid having to give permissions to every channel id version of the preview url.
    // Use the flag ?local-weblab2-preview=true or ?enableExperiments=local-weblab2-preview
    // to enable the fixed prefix locally.
    const prefix =
      useLocalPrefixOverride && isLocalhost
        ? 'localtesting'
        : normalizedChannelId;
    const port = isLocalhost && location.port ? `:${location.port}` : '';
    return `${location.protocol}//${prefix}.preview.${subdomain}codeprojects.org${port}`;
  }, [normalizedChannelId]);

  const isAiTutorVersion = useAppSelector(
    state => state.lab2Project.viewingAiTutorVersion
  );

  // The new preview is currently behind an experiment flag. We pass this flag
  // through to the inner iframe via a query string so it knows whether or not to use the new preview.
  const previewQueryString = useMemo(() => {
    const useV2Preview = experiments.isEnabledAllowingQueryString(
      experiments.WEBLAB2_PREVIEW_V2
    );
    return useV2Preview ? `?${experiments.WEBLAB2_PREVIEW_V2}=true` : '';
  }, []);

  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [navigationHistoryIndex, setNavigationHistoryIndex] = useState(-1);

  const source = useAppSelector(
    state =>
      state.lab2Project.projectSources?.source as MultiFileSource | undefined
  );

  const isEmptyProject =
    !source ||
    (Object.keys(source.files).length === 0 &&
      Object.keys(source.folders).length === 0);

  const aiFilePathToPreview = useAppSelector(
    state => state.weblab2.aiFilePathToPreview
  );
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [debouncedSource, setDebouncedSource] = useState(
    filterSourceForPreview(source)
  );
  const sourceLevelId = useRef<number | undefined>(undefined);
  const [isLevelLoading, setIsLevelLoading] = useState(false);
  const [inputValue, setInputValue] = useState<string>(DEFAULT_START_HTML_FILE);
  const [currentFile, setCurrentFile] = useState<string>(
    DEFAULT_START_HTML_FILE
  );
  const [previewViewMode, setPreviewViewMode] = useState<PreviewViewMode>(
    PreviewViewMode.DESKTOP
  );
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const isPredictLevel = levelProperties?.predictSettings?.isPredictLevel;
  const hasSubmittedPredictResponse = useAppSelector(
    isPredictResponseSubmitted
  );
  const allowUserScripts = !isPredictLevel || hasSubmittedPredictResponse;
  const canNavigateBack = navigationHistoryIndex > 0;
  const canNavigateForward =
    navigationHistoryIndex < navigationHistory.length - 1;

  useEffect(() => {
    if (aiFilePathToPreview) {
      setCurrentFile(aiFilePathToPreview.path);
      setInputValue(aiFilePathToPreview.path);
    } else {
      setCurrentFile(DEFAULT_START_HTML_FILE);
      setInputValue(DEFAULT_START_HTML_FILE);
      setNavigationHistory([DEFAULT_START_HTML_FILE]);
      setNavigationHistoryIndex(0);
    }
  }, [aiFilePathToPreview]);

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
    if (isAiTutorVersion) {
      sendLab2AnalyticsEvent(
        EVENTS.AI_TUTOR_VERSION_FILE_PREVIEWED_IN_URL_BAR,
        {
          fileName: newInputValue,
          fileType: newInputValue.split('.').pop() || '',
        }
      );
    }
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

  const onStopPreview = () => {
    setIsStopped(true);
    setIsIframeLoaded(false);
  };

  const onReloadPreview = () => {
    setIsStopped(false);
  };

  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    // When we switch levels, clear the source so the preview does not show outdated content.
    setDebouncedSource(undefined);
    // When we switch levels, reset stopped state and iframe state.
    setIsStopped(false);
    setIsLevelLoading(true);
    setIsIframeLoaded(false);
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
        // Send the source immediately when iframe is ready
        if (debouncedSource) {
          iframeRef.current?.contentWindow?.postMessage(
            {type: IframeMessageType.SET_SOURCE, source: debouncedSource},
            previewUrl
          );
        }
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
  }, [
    previewUrl,
    currentFile,
    navigationHistory,
    navigationHistoryIndex,
    debouncedSource,
  ]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessageType.CHANGE_FILE_URL_BAR, fileName: currentFile},
      previewUrl
    );
  }, [currentFile, previewUrl]);

  useEffect(() => {
    if (isLevelLoading) {
      // If the level is currently loading, we skip sending a potentially outdated source.
      return;
    }
    if (sourceLevelId.current !== levelProperties.id) {
      // If we have a new level id, update the source immediately.
      setDebouncedSource(filterSourceForPreview(source));
      sourceLevelId.current = levelProperties.id;
      setCurrentFile(DEFAULT_START_HTML_FILE);
      setInputValue(DEFAULT_START_HTML_FILE);
      setNavigationHistory([DEFAULT_START_HTML_FILE]);
      setNavigationHistoryIndex(0);
    } else {
      // Set a timeout to send the debounced value after 500ms
      const debouncedSourceSetter = setTimeout(() => {
        // Only update the source if the filtered source has changed.
        setDebouncedSource(previousSource => {
          const newFilteredSource = filterSourceForPreview(source);
          if (!isEqual(previousSource, newFilteredSource)) {
            return newFilteredSource;
          }
          return previousSource;
        });
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

  // Inform the inner preview when we start/finish loading the level,
  // so it can avoid showing outdated content while we are loading.
  useEffect(() => {
    if (isIframeLoaded && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        {type: IframeMessageType.LEVEL_LOADING, isLoading: isLevelLoading},
        previewUrl
      );
    }
  }, [isIframeLoaded, isLevelLoading, previewUrl]);

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
      className={classNames(
        isFullScreenView && moduleStyles.fullScreenPanelContainer
      )}
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
          onStopPreview={onStopPreview}
          isStopEnabled={!isStopped}
        />
        {isEmptyProject ? (
          <PreviewEmptyState />
        ) : isStopped ? (
          <PreviewStopped onReload={onReloadPreview} />
        ) : isLevelLoading ? (
          <CodebridgeEmptyState title="Loading..." />
        ) : (
          /* This iframe points to the environment-specific version of preview.codeprojects.org. That url will eventually
            route to InnerHTMLPreview. */
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
                previewViewMode === PreviewViewMode.DESKTOP
                  ? moduleStyles.desktopPreviewIframe
                  : moduleStyles.mobilePreviewIframe
              )}
              src={`${previewUrl}${previewQueryString}`}
            />
          </div>
        )}
      </div>
    </PanelContainer>
  );
};
