import {
  CodebridgeContextProvider,
  sourceReducer,
  SOURCE_REDUCER_ACTIONS,
  useSourceUtilities,
} from '@codebridge/codebridgeContext';
import {useReducerWithCallback, useZoomTracker} from '@codebridge/hooks';
import {
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
  OnRunFunction,
  SendConsoleInputFunction,
  CodebridgeLevelProperties,
  ProjectPickerSettings,
} from '@codebridge/types';
import classNames from 'classnames';
import React, {useEffect, useMemo, useReducer, useRef} from 'react';

import {LabConfig, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/codebridgeContainer.module.scss';
import './styles/codebridge.scss';

type CodebridgeProps = {
  source: MultiFileSource;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
  startSources: ProjectSources;
  onRun?: OnRunFunction;
  onStop?: () => void;
  projectVersion: number;
  labConfig?: LabConfig;
  sendConsoleInput?: SendConsoleInputFunction;
  levelProperties: CodebridgeLevelProperties;
  projectPickerSettings?: ProjectPickerSettings;
};

export const Codebridge = React.memo(
  ({
    source,
    config,
    setProject,
    setConfig,
    startSources,
    onRun,
    onStop,
    projectVersion,
    labConfig,
    sendConsoleInput,
    levelProperties,
    projectPickerSettings,
  }: CodebridgeProps) => {
    const reducerWithCallback = useReducerWithCallback(
      sourceReducer,
      (source: MultiFileSource) => setProject({source, labConfig}),
      new Set(SOURCE_REDUCER_ACTIONS.REPLACE_SOURCE)
    );
    const [internalSource, dispatch] = useReducer(reducerWithCallback, source);
    const isShareView = useAppSelector(state => state.lab.isShareView);

    const sourceUtilities = useSourceUtilities(dispatch);

    const currentProjectVersion = useRef(projectVersion);

    // Adds keyboard shortcuts for Run (r), Console (o) and Editor (e),
    // which are preceded by Control (Windows/Linux) or Command (macOS).
    // Runs on mount (see empty dependency list).
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Check if Control (Windows/Linux) or Command (macOS) is pressed
        const isControlOrCommand = event.ctrlKey || event.metaKey;
        if (isControlOrCommand && event.key === 'r') {
          const editorElement = document.querySelector(
            '#uitest-codebridge-run'
          );
          if (editorElement) {
            // Click will run code and then move focus to console
            (editorElement as HTMLElement).click();
          }
          event.preventDefault();
        } else if (isControlOrCommand && event.key === 'e') {
          const editorElement = document.querySelector(
            '#uitest-codebridge-editor'
          );
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
        } else if (isControlOrCommand && event.key === 'o') {
          const consoleElement = document.querySelector(
            '.xterm-helper-textarea'
          );
          if (consoleElement) {
            (consoleElement as HTMLElement).focus();
          }
          event.preventDefault();
        }
      };

      // Attach the event listener
      document.addEventListener('keydown', handleKeyDown);

      // Cleanup the event listener on unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, []);

    useEffect(() => {
      if (projectVersion !== currentProjectVersion.current) {
        sourceUtilities.replaceSource(source);
        currentProjectVersion.current = projectVersion;
      }
    }, [currentProjectVersion, sourceUtilities, projectVersion, source]);

    const InnerLayout = useMemo(() => {
      if (isShareView && config.layoutComponents.share) {
        return config.layoutComponents.share;
      }
      let currentLayout = config.activeLayout;
      if (!currentLayout) {
        currentLayout = 'horizontal';
      }
      return config.layoutComponents[currentLayout];
    }, [config.activeLayout, config.layoutComponents, isShareView]);

    const appName = levelProperties.appName;

    const backpackApi = useMemo(
      () => new BackpackClientApi(appName, null),
      [appName]
    );

    // Send analytics when user zooms in/out (will be compared to user updating font size via settings).
    useZoomTracker(appName);

    return (
      <CodebridgeContextProvider
        value={{
          source: internalSource,
          config,
          setProject,
          setConfig,
          startSources,
          onRun,
          onStop,
          ...sourceUtilities,
          labConfig,
          sendConsoleInput,
          levelProperties,
          projectPickerSettings,
        }}
      >
        <BackpackAPIContext.Provider value={backpackApi}>
          <div className={classNames(moduleStyles.codebridgeContainer)}>
            <InnerLayout isProjectLevel={levelProperties.isProjectLevel} />
          </div>
        </BackpackAPIContext.Provider>
      </CodebridgeContextProvider>
    );
  }
);
