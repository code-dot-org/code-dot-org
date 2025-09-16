import {CodebridgeContextProvider} from '@codebridge/codebridgeContext';
import {useFlaggedImage, useZoomTracker} from '@codebridge/hooks';
import {setWidgetViewShowCode} from '@codebridge/redux/workspaceRedux';
import {
  ConfigType,
  SetConfigFunction,
  OnRunFunction,
  SendConsoleInputFunction,
  CodebridgeLevelProperties,
  ProjectPickerSettings,
  LayoutProps,
} from '@codebridge/types';
import classNames from 'classnames';
import React, {useEffect, useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import FlaggedImageModal from '@cdo/apps/sharedComponents/FlaggedImageModal';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {AiTutorContext} from '../aiTutor/types';

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
  aiTutorSystemPromptName?: string;
  aiTutorContextPromise?: Promise<AiTutorContext>;
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
    aiTutorSystemPromptName,
    aiTutorContextPromise,
  }: CodebridgeProps) => {
    const isShareView = useAppSelector(state => state.lab.isShareView);
    const isWidgetView = !!levelProperties.widgetView;
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const appName = levelProperties.appName;
    const isFullScreenView = useAppSelector(
      state => state.lab.isFullScreenView
    );

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

    const InnerLayout = useMemo((): React.FunctionComponent<LayoutProps> => {
      if (isShareView && config.layoutComponents.share) {
        return config.layoutComponents.share;
      }
      if (isWidgetView && config.layoutComponents.widget && !isStartMode) {
        return config.layoutComponents.widget;
      }
      if (isFullScreenView && config.layoutComponents.fullScreen) {
        return config.layoutComponents.fullScreen;
      }
      let currentLayout = config.activeLayout;
      if (!currentLayout) {
        currentLayout = appName === 'pythonlab' ? 'horizontal' : 'vertical';
      }
      // Since 'horizontal' is an optional layout (not all labs have it),
      // we need to add a fallback to 'vertical' to avoid type errors.
      return (
        config.layoutComponents[currentLayout] ||
        config.layoutComponents.vertical
      );
    }, [
      appName,
      config.activeLayout,
      config.layoutComponents,
      isFullScreenView,
      isShareView,
      isStartMode,
      isWidgetView,
    ]);

    const backpackApi = useMemo(
      () => new BackpackClientApi(appName, null),
      [appName]
    );

    // Send analytics when user zooms in/out (will be compared to user updating font size via settings).
    useZoomTracker(appName);

    const dispatch = useAppDispatch();

    // Set view code to false if level is switched for any levels in widget view.
    useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
      dispatch(setWidgetViewShowCode(false));
    });

    const {
      flaggedImageData,
      onImageFlagged,
      handleAcceptFlaggedImage,
      handleCancelFlaggedImage,
    } = useFlaggedImage();

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
          aiTutorContextPromise,
          onImageFlagged,
          aiTutorSystemPromptName,
        }}
      >
        <BackpackAPIContext.Provider value={backpackApi}>
          <div className={classNames(moduleStyles.codebridgeContainer)}>
            {flaggedImageData && (
              <FlaggedImageModal
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
