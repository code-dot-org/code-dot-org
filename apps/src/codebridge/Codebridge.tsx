import {CodebridgeContextProvider} from '@codebridge/codebridgeContext';
import {useZoomTracker} from '@codebridge/hooks';
import {setWidgetViewShowCode} from '@codebridge/redux/workspaceRedux';
import {
  ConfigType,
  SetConfigFunction,
  OnRunFunction,
  SendConsoleInputFunction,
  CodebridgeLevelProperties,
  ProjectPickerSettings,
} from '@codebridge/types';
import classNames from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import FlaggedImageModal from '@cdo/apps/sharedComponents/FlaggedImageModal';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/codebridgeContainer.module.scss';
import './styles/codebridge.scss';

const RUN_BUTTON_ID = '#uitest-codebridge-run';
const EDITOR_ID = '#uitest-codebridge-editor';
const CONSOLE_CLASS = '.xterm-helper-textarea';

type CodebridgeProps = {
  config: ConfigType;
  setConfig: SetConfigFunction;
  startSources: ProjectSources;
  onRun?: OnRunFunction;
  onStop?: () => void;
  sendConsoleInput?: SendConsoleInputFunction;
  levelProperties: CodebridgeLevelProperties;
  projectPickerSettings?: ProjectPickerSettings;
  AiTutor2ResponseView?: React.ReactNode;
  aiTutor2Context?: string;
};

export const Codebridge = React.memo(
  ({
    config,
    setConfig,
    startSources,
    onRun,
    onStop,
    sendConsoleInput,
    levelProperties,
    projectPickerSettings,
    AiTutor2ResponseView,
    aiTutor2Context,
  }: CodebridgeProps) => {
    const isShareView = useAppSelector(state => state.lab.isShareView);
    const channelId = useAppSelector(state => state.lab.channel?.id);
    const isWidgetView = !!levelProperties.widgetView;
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

    // Adds keyboard shortcuts for Editor (1), Run (2), and Console (3)
    // which are preceded by Control (Windows/Linux) or Command (macOS).
    // Runs on mount (see empty dependency list).
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Check if Control (Windows/Linux) or Command (macOS) is pressed
        const isControlOrCommand = event.ctrlKey || event.metaKey;
        const editorElement = document.querySelector(EDITOR_ID);
        const runButton = document.querySelector(RUN_BUTTON_ID);
        const consoleElement = document.querySelector(CONSOLE_CLASS);
        if (isControlOrCommand) {
          switch (event.key) {
            case '1':
              if (editorElement) {
                (editorElement as HTMLElement).focus();
                // Also simulate 'Enter' to actually enter the editor
                const enterKeyEvent = new KeyboardEvent('keydown', {
                  key: 'Enter',
                  keyCode: 13,
                  bubbles: true,
                });
                editorElement.dispatchEvent(enterKeyEvent);
              }
              event.preventDefault();
              break;
            case '2':
              if (runButton) {
                (runButton as HTMLElement).click();
              }
              event.preventDefault();
              break;
            case '3':
              if (consoleElement) {
                (consoleElement as HTMLElement).focus();
              }
              event.preventDefault();
              break;
            default:
              break;
          }
        }
      };

      // Attach the event listener
      document.addEventListener('keydown', handleKeyDown);

      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, []);

    const InnerLayout = useMemo(() => {
      if (isShareView && config.layoutComponents.share) {
        return config.layoutComponents.share;
      }
      if (isWidgetView && config.layoutComponents.widget && !isStartMode) {
        return config.layoutComponents.widget;
      }
      let currentLayout = config.activeLayout;
      if (!currentLayout) {
        currentLayout = 'horizontal';
      }
      return config.layoutComponents[currentLayout];
    }, [
      config.activeLayout,
      config.layoutComponents,
      isShareView,
      isStartMode,
      isWidgetView,
    ]);

    const appName = levelProperties.appName;

    const backpackApi = useMemo(
      () => new BackpackClientApi(appName, null),
      [appName]
    );

    // Send analytics when user zooms in/out (will be compared to user updating font size via settings).
    useZoomTracker(appName);

    const dispatch = useAppDispatch();
    const [flaggedImageData, setFlaggedImageData] = useState<{
      file: File;
      fileType: string;
      uploadFunction: () => Promise<void>;
    } | null>(null);

    // Set view code to false if level is switched for any levels in widget view.
    useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
      dispatch(setWidgetViewShowCode(false));
    });

    const onImageFlagged = (
      file: File,
      fileType: string,
      uploadFunction: () => Promise<void>
    ) => {
      setFlaggedImageData({file, fileType, uploadFunction});
    };

    const handleAcceptFlaggedImage = async () => {
      if (!flaggedImageData) return;

      try {
        await flaggedImageData.uploadFunction();
        setFlaggedImageData(null);
        const body = JSON.stringify({type: 'flag'});
        if (channelId) {
          try {
            await HttpClient.post(
              `/v3/channels/${channelId}/abuse/image`,
              body,
              true,
              {'Content-Type': 'application/json; charset=UTF-8'}
            );
          } catch (error) {
            Lab2Registry.getInstance()
              .getMetricsReporter()
              .logError(
                'Error flagging channel due to flagged image',
                error as Error
              );
          }
        }
      } catch (error) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Error uploading flagged image asset', error as Error);
        setFlaggedImageData(null);
      }
    };

    const handleCancelFlaggedImage = () => {
      setFlaggedImageData(null);
    };

    return (
      <CodebridgeContextProvider
        value={{
          config,
          setConfig,
          startSources,
          onRun,
          onStop,
          sendConsoleInput,
          levelProperties,
          projectPickerSettings,
          AiTutor2ResponseView,
          aiTutor2Context,
          onImageFlagged,
        }}
      >
        <BackpackAPIContext.Provider value={backpackApi}>
          <div className={classNames(moduleStyles.codebridgeContainer)}>
            {flaggedImageData && (
              <FlaggedImageModal
                isOpen={flaggedImageData !== null}
                onAccept={handleAcceptFlaggedImage}
                onCancel={handleCancelFlaggedImage}
              />
            )}
            <InnerLayout
              isProjectLevel={levelProperties.isProjectLevel}
              isWidgetView={levelProperties.widgetView}
            />
          </div>
        </BackpackAPIContext.Provider>
      </CodebridgeContextProvider>
    );
  }
);
