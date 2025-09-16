// Pythonlab view
import {Codebridge} from '@codebridge/Codebridge';
import {useSource} from '@codebridge/hooks/useSource';
import {CodebridgeLevelProperties, ConfigType} from '@codebridge/types';
import {python} from '@codemirror/lang-python';
import {LanguageSupport} from '@codemirror/language';
import React, {useContext, useEffect, useMemo, useState} from 'react';

import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {TestResults} from '@cdo/apps/constants';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {changeProjectType} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {submitPredictResponse} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LabProps, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import pythonlabI18n from '@cdo/apps/pythonlab/locale';
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

import {AiTutorContext} from '../aiTutor/types';
import CodebridgeRegistry from '../codebridge/CodebridgeRegistry';

import getAiTutorContextPromise from './aiTutorHelper';
import ProjectTypePicker from './components/ProjectTypePicker';
import {
  DEFAULT_PROJECT,
  STANDALONE_CONSOLE_PROJECT,
  STANDALONE_NEIGHBORHOOD_PROJECT,
  PYTHONLAB_EDITABLE_FILE_TYPES,
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
  languageMapping: pythonlabLangMapping,
  editableFileTypes: PYTHONLAB_EDITABLE_FILE_TYPES,
  activeLayout: 'horizontal',
  layoutComponents: {
    horizontal: HorizontalLayout,
    vertical: VerticalLayout,
    share: ShareView,
    widget: HorizontalLayout,
  },
};

const PythonlabView: React.FunctionComponent<
  LabProps<CodebridgeLevelProperties, ProjectSources>
> = ({levelProperties, initialSources}) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {startSources} = useSource(
    DEFAULT_PROJECT,
    levelProperties,
    initialSources
  );
  const validationFile = levelProperties.validationFile;
  const isPredictLevel = levelProperties.predictSettings?.isPredictLevel;
  const progressManager = useContext(ProgressManagerContext);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const currentLevelStatus = useAppSelector(
    state => getCurrentLevel(state)?.status
  );
  const lastSavedLabConfig = useAppSelector(
    state => state.lab2Project.lastSavedLabConfig
  );
  const source = useAppSelector(
    state =>
      state.lab2Project.projectSources?.source as MultiFileSource | undefined
  );
  const labConfig = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig
  );
  const miniAppName = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );

  const hasSource = !!source;
  const isAiTutor2Enabled = useMemo(() => {
    return (
      levelProperties.aiTutorAvailable ||
      queryParams('show-ai-tutor2') === 'true'
    );
  }, [levelProperties.aiTutorAvailable]);

  const [aiTutorContextPromise, setAiTutorContextPromise] =
    useState<Promise<AiTutorContext>>();

  const dispatch = useAppDispatch();

  const currentProjectType = useMemo(() => {
    // The current project type is determined by the last saved lab config
    // if it exists, otherwise it is determined by the lab config provided by useSource.
    // The reason for this is the useSource lab config could be the lab config when viewing
    // a previous version of the project, and we want to use the lab config from their most recent
    // save. I.e., if the user is currently on a neighborhood project, but a previous version was console,
    // we want to show them the start sources for neighborhood.
    if (levelProperties.isProjectLevel) {
      const labConfigToUse = lastSavedLabConfig || labConfig;
      return (
        labConfigToUse?.standaloneSettings?.projectType ||
        labConfigToUse?.miniApp?.name ||
        'console'
      );
    }
    return undefined;
  }, [labConfig, lastSavedLabConfig, levelProperties.isProjectLevel]);

  const levelStartSources = useMemo(() => {
    // For new standalone project levels, we use the standalone start sources map to determine
    // the start sources, so we can show the user the start code for their chosen project type,
    // and not accidentally show them the project picker again.
    if (currentProjectType) {
      return standaloneStartSources[currentProjectType];
    } else {
      return startSources;
    }
  }, [currentProjectType, startSources]);

  const showProjectPickerModal =
    showProjectPicker ||
    (levelProperties.isProjectLevel &&
      !initialSources &&
      !labConfig?.standaloneSettings?.projectType) ||
    false;

  const projectPickerSettings = useMemo(() => {
    if (!levelProperties.isProjectLevel) {
      return undefined;
    }
    return {
      currentType:
        currentProjectType === 'neighborhood'
          ? pythonlabI18n.neighborhood()
          : pythonlabI18n.consoleOnly(),
      showProjectTypePicker: () => setShowProjectPicker(true),
    };
  }, [currentProjectType, levelProperties.isProjectLevel]);

  useEffect(() => {
    if (progressManager && levelProperties.appName === 'pythonlab') {
      progressManager.setValidator(
        new PythonValidator(PythonValidationTracker.getInstance())
      );
    }
  }, [progressManager, levelProperties.appName]);

  const handleProjectTypeChange = (type: 'console' | 'neighborhood') => {
    const project = standaloneStartSources[type];
    dispatch(changeProjectType({newSources: project}));
    // Clear the console when switching project types.
    const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
    consoleManager?.clearTerminalLines();
    setShowProjectPicker(false);
  };

  // Ensure any in-progress program is stopped when the level is switched.
  useLifecycleNotifier(
    LifecycleEvent.LevelLoadStarted,
    restartPyodideIfProgramIsRunning
  );

  useEffect(() => {
    // TODO: This log is a bit chatty, but useful while we're working on this feature.
    // remove once tutor context is more stable, or if it gets annoying.
    console.log(`🤖: Tutor context updated:`, aiTutorContextPromise);
  }, [aiTutorContextPromise]);

  useEffect(() => {
    if (isAiTutor2Enabled) {
      setAiTutorContextPromise(
        getAiTutorContextPromise(
          source,
          validationFile,
          levelProperties.longInstructions,
          miniAppName
        )
      );
    }
  }, [
    levelProperties.longInstructions,
    source,
    validationFile,
    miniAppName,
    isAiTutor2Enabled,
  ]);

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
    if (!isPredictLevel && currentLevelStatus === LevelStatus.not_tried) {
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
      {hasSource && (
        <Codebridge
          config={config}
          setConfig={setConfig}
          startSources={levelStartSources}
          onRun={onRun}
          onStop={stopPythonCode}
          sendConsoleInput={sendInput}
          levelProperties={levelProperties}
          projectPickerSettings={projectPickerSettings}
          aiTutorContextPromise={aiTutorContextPromise}
        />
      )}
      {showProjectPickerModal && (
        <ProjectTypePicker
          setProjectCallback={handleProjectTypeChange}
          currentProjectType={
            initialSources || labConfig?.standaloneSettings?.projectType
              ? currentProjectType
              : undefined
          }
          closeDialog={() => setShowProjectPicker(false)}
        />
      )}
    </div>
  );
};

export default PythonlabView;
