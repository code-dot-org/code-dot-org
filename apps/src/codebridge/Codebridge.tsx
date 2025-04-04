import {
  CodebridgeContextProvider,
  sourceReducer,
  SOURCE_REDUCER_ACTIONS,
  useSourceUtilities,
} from '@codebridge/codebridgeContext';
import {useReducerWithCallback} from '@codebridge/hooks';
import {
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
  OnRunFunction,
  SendConsoleInputFunction,
  CodebridgeLevelProperties,
} from '@codebridge/types';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import React, {useEffect, useMemo, useReducer, useRef} from 'react';

import {LabConfig, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/codebridgeContainer.module.scss';
import './styles/codebridge.scss';

const DEBOUNCE_TIME_OUT = 300;

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
    const getInitialDevicePixelRatio = (): number => {
      return window?.devicePixelRatio || 1;
    };

    const detectZoom = (initialDPR: number): number[] => {
      const currentDPR = window.devicePixelRatio || 1;
      const zoomDPR = currentDPR / initialDPR;
      const zoomValues = [Math.round(zoomDPR * 100), 100];
      if (window.visualViewport?.scale) {
        zoomValues[1] = Math.round(window.visualViewport.scale * 100);
      }
      return zoomValues;
    };

    useEffect(() => {
      const initialDPR = getInitialDevicePixelRatio();
      let lastZoomValues = detectZoom(initialDPR);

      const logZoomChange = (zoomPercent: number, direction: 'in' | 'out') => {
        console.log('BrowserZoomChanged', {
          zoomPercent,
          direction,
          appName,
        });
      };

      const checkZoom = () => {
        const currentZoomValues = detectZoom(initialDPR);
        let loggedZoom = false;
        currentZoomValues.forEach((zoomValue, index) => {
          if (zoomValue !== lastZoomValues[index] && !loggedZoom) {
            const direction =
              currentZoomValues[0] > lastZoomValues[0] ? 'in' : 'out';
            logZoomChange(currentZoomValues[index], direction);
            lastZoomValues = currentZoomValues;
            loggedZoom = true;
          }
        });
      };
      const debouncedCheckZoom = debounce(checkZoom, DEBOUNCE_TIME_OUT);
      window.visualViewport?.addEventListener('resize', debouncedCheckZoom);

      return () => {
        debouncedCheckZoom.cancel();
        // clearInterval(interval);
        window.visualViewport?.removeEventListener(
          'resize',
          debouncedCheckZoom
        );
      };
    }, [appName]);

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
