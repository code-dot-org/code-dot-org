// Pythonlab view
import {Codebridge} from '@codebridge/Codebridge';
import {useSource} from '@codebridge/hooks/useSource';
import {CodebridgeLevelProperties, ConfigType} from '@codebridge/types';
import {python} from '@codemirror/lang-python';
import {LanguageSupport} from '@codemirror/language';
import React, {useContext, useEffect, useMemo, useState} from 'react';

import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {TestResults} from '@cdo/apps/constants';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {setAndSaveProjectSources} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {submitPredictResponse} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LabProps, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {
  restartPyodideIfProgramIsRunning,
  sendInput,
} from '@cdo/apps/pythonlab/pyodideWorkerManager';
import {
  AppDispatch,
  useAppDispatch,
  useAppSelector,
} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import ProjectTypePicker from './components/ProjectTypePicker';
import {
  DEFAULT_PROJECT,
  STANDALONE_CONSOLE_PROJECT,
  STANDALONE_NEIGHBORHOOD_PROJECT,
} from './constants';
import HorizontalLayout from './layout/HorizontalLayout';
import ShareView from './layout/ShareView';
import VerticalLayout from './layout/VerticalLayout';
import PythonValidationTracker from './progress/PythonValidationTracker';
import PythonValidator from './progress/PythonValidator';
import {handleRunClick, stopPythonCode} from './pyodideRunner';

import moduleStyles from './pythonlab-view.module.scss';

const pythonlabLangMapping: {[key: string]: LanguageSupport} = {
  py: python(),
};

const standaloneStartSources: {[key: string]: ProjectSources} = {
  console: STANDALONE_CONSOLE_PROJECT,
  neighborhood: STANDALONE_NEIGHBORHOOD_PROJECT,
};

const defaultConfig: ConfigType = {
  activeLeftNav: 'Files',
  languageMapping: pythonlabLangMapping,
  editableFileTypes: ['py', 'csv', 'txt'],
  leftNav: [
    {
      icon: 'fa-square-check',
      component: 'info-panel',
    },
    {
      icon: 'fa-file',
      component: 'Files',
    },
    {
      icon: 'fa-solid fa-magnifying-glass',
      component: 'Search',
    },
  ],
  sideBar: [
    {
      icon: 'fa-circle-question',
      label: 'Help',
      action: () => window.alert('Help is not currently implemented'),
    },
    {
      icon: 'fa-folder',
      label: 'Files',
      action: () => window.alert('You are already on the file browser'),
    },
  ],

  activeLayout: 'horizontal',
  showFileBrowser: true,
  validMimeTypes: ['text/'],
  layoutComponents: {
    horizontal: HorizontalLayout,
    vertical: VerticalLayout,
    share: ShareView,
  },
};

const PythonlabView: React.FunctionComponent<
  LabProps<CodebridgeLevelProperties, ProjectSources>
> = ({levelProperties, initialSources}) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {
    source,
    setProject,
    startSources,
    projectVersion,
    validationFile,
    labConfig,
  } = useSource(DEFAULT_PROJECT, levelProperties, initialSources);
  const isPredictLevel = levelProperties.predictSettings?.isPredictLevel;
  const progressManager = useContext(ProgressManagerContext);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const currentLevel = useAppSelector(state => getCurrentLevel(state));
  const dispatch = useAppDispatch();

  const getInitialDevicePixelRatio = (): number => {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  };

  const detectZoom = (initialDPR: number): number[] => {
    // Works with pinch in/out
    console.log('window.visualViewport?.scale', window.visualViewport?.scale);
    // works with browser zoom setting

    const currentDPR = window.devicePixelRatio || 1;
    const zoom = currentDPR / initialDPR;
    console.log('devicePixelRatio zoom', zoom);
    const zoomValues = [100, Math.round(zoom * 100)];
    if (window.visualViewport?.scale) {
      zoomValues[0] = Math.round(window.visualViewport.scale * 100);
    }
    if (window.devicePixelRatio) {
      zoomValues[1] = Math.round(window.devicePixelRatio * 100);
    }
    return zoomValues;
  };

  useEffect(() => {
    const initialDPR = getInitialDevicePixelRatio();
    let lastZoomValues = detectZoom(initialDPR);
    const pageLoadState = document.readyState;

    const logZoomChange = (zoomPercent: number, direction: 'in' | 'out') => {
      console.log('BrowserZoomChanged', {
        zoomPercent,
        direction,
        pageLoadState,
      });
    };

    const checkZoom = () => {
      const currentZoomValues = detectZoom(initialDPR);
      if (currentZoomValues[0] !== lastZoomValues[0]) {
        const direction =
          currentZoomValues[0] > lastZoomValues[0] ? 'in' : 'out';
        logZoomChange(currentZoomValues[0], direction);
        lastZoomValues = currentZoomValues;
      } else if (currentZoomValues[1] !== lastZoomValues[1]) {
        const direction =
          currentZoomValues[1] > lastZoomValues[1] ? 'in' : 'out';
        logZoomChange(currentZoomValues[1], direction);
        lastZoomValues = currentZoomValues;
      }
    };
    const interval = setInterval(checkZoom, 1000);
    window.visualViewport?.addEventListener('resize', checkZoom);

    return () => {
      clearInterval(interval);
      window.visualViewport?.removeEventListener('resize', checkZoom);
    };
  }, []);

  const levelStartSources = useMemo(() => {
    // For new standalone project levels, we use the standalone start sources map to determine
    // the start sources, so we can show the user the start code for their chosen project type,
    // and not accidentally show them the project picker again.
    if (levelProperties.isProjectLevel) {
      const currentProjectType =
        labConfig?.standaloneSettings?.projectType || 'console';
      return standaloneStartSources[currentProjectType];
    } else {
      return startSources;
    }
  }, [
    labConfig?.standaloneSettings?.projectType,
    levelProperties.isProjectLevel,
    startSources,
  ]);

  const showProjectPickerModal =
    (levelProperties.isProjectLevel &&
      !initialSources &&
      !labConfig?.standaloneSettings?.projectType) ||
    false;

  useEffect(() => {
    if (progressManager && levelProperties.appName === 'pythonlab') {
      progressManager.setValidator(
        new PythonValidator(PythonValidationTracker.getInstance())
      );
    }
  }, [progressManager, levelProperties.appName]);

  const handleProjectTypeChange = (type: 'console' | 'neighborhood') => {
    const project = standaloneStartSources[type];
    dispatch(setAndSaveProjectSources(project));
  };

  // Ensure any in-progress program is stopped when the level is switched.
  useLifecycleNotifier(
    LifecycleEvent.LevelLoadStarted,
    restartPyodideIfProgramIsRunning
  );

  const onRun = async (
    runTests: boolean,
    dispatch: AppDispatch,
    source: MultiFileSource | undefined
  ) => {
    // Flush any pending saves if we have a project manager on run. The user will likely
    // run their code before navigating away from the page, so switching pages
    // will be faster if we flush save now.
    Lab2Registry.getInstance().getProjectManager()?.flushSave();
    // We don't send the validation file to the runner if we are in start mode,
    // as we want to use the validation from the sources instead.
    await handleRunClick(
      runTests,
      dispatch,
      source,
      progressManager,
      isStartMode ? undefined : validationFile
    );
    if (
      currentLevel &&
      !isPredictLevel &&
      currentLevel.status === LevelStatus.not_tried
    ) {
      // If this is not a predict level and the current status is not tried,
      // send a level started progress report.
      dispatch(
        sendProgressReport(
          levelProperties.appName || '',
          TestResults.LEVEL_STARTED
        )
      );
    }
    dispatch(submitPredictResponse({appType: 'pythonlab'}));
  };

  return (
    <div className={moduleStyles.pythonlab}>
      {source && (
        <Codebridge
          source={source}
          config={config}
          setProject={setProject}
          setConfig={setConfig}
          startSources={levelStartSources}
          onRun={onRun}
          onStop={stopPythonCode}
          projectVersion={projectVersion}
          labConfig={labConfig}
          sendConsoleInput={sendInput}
          levelProperties={levelProperties}
        />
      )}
      {showProjectPickerModal && (
        <ProjectTypePicker setProjectCallback={handleProjectTypeChange} />
      )}
    </div>
  );
};

export default PythonlabView;
