// Pythonlab view
import {Codebridge} from '@codebridge/Codebridge';
import {useSource} from '@codebridge/hooks/useSource';
import {ConfigType} from '@codebridge/types';
import {python} from '@codemirror/lang-python';
import {LanguageSupport} from '@codemirror/language';
import React, {useContext, useEffect, useState} from 'react';

import {sendPredictLevelReport} from '@cdo/apps/code-studio/progressRedux';
import {MAIN_PYTHON_FILE, START_SOURCES} from '@cdo/apps/lab2/constants';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {isPredictAnswerLocked} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {
  MultiFileSource,
  ProjectFileType,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {AppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import useLifecycleNotifier from '../lab2/hooks/useLifecycleNotifier';

import PythonValidationTracker from './progress/PythonValidationTracker';
import PythonValidator from './progress/PythonValidator';
import {handleRunClick, stopPythonCode} from './pyodideRunner';
import {restartPyodideIfProgramIsRunning} from './pyodideWorkerManager';

import moduleStyles from './pythonlab-view.module.scss';

const pythonlabLangMapping: {[key: string]: LanguageSupport} = {
  py: python(),
};

const defaultProject: ProjectSources = {
  source: {
    files: {
      '0': {
        id: '0',
        name: MAIN_PYTHON_FILE,
        language: 'py',
        contents: 'print("Hello world!")',
        folderId: '0',
        active: true,
        open: true,
      },
    },
    folders: {},
  },
};

const labeledGridLayouts = {
  horizontal: {
    gridLayoutRows: '1fr',
    gridLayoutColumns: '340px minmax(0, 1fr)',
    gridLayout: `
  "info-panel workspace-and-console"
  `,
  },
  vertical: {
    gridLayoutRows: '1fr',
    gridLayoutColumns: '340px minmax(0, 1fr) 400px',
    gridLayout: `
    "info-panel workspace console"
    `,
  },
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

  labeledGridLayouts,
  activeGridLayout: 'horizontal',
  showFileBrowser: true,
};

const PythonlabView: React.FunctionComponent = () => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {source, setSource, startSource, projectVersion, validationFile} =
    useSource(defaultProject);
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);
  const progressManager = useContext(ProgressManagerContext);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  useEffect(() => {
    if (progressManager && appName === 'pythonlab') {
      progressManager.setValidator(
        new PythonValidator(PythonValidationTracker.getInstance())
      );
    }
  }, [progressManager, appName]);

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
    let validationFileToSend = validationFile;
    // In start mode, pull the validation file from the source, rather
    // than the level.
    if (isStartMode) {
      const validationFileFromSource = Object.values(source?.files || {}).find(
        file => file.type === ProjectFileType.VALIDATION
      );
      if (validationFileFromSource) {
        validationFileToSend = validationFileFromSource;
      }
    }
    await handleRunClick(
      runTests,
      dispatch,
      source,
      progressManager,
      validationFileToSend
    );
    // Only send a predict level report if this is a predict level and the predict
    // answer was not locked.
    if (isPredictLevel && !predictAnswerLocked) {
      dispatch(
        sendPredictLevelReport({
          appType: 'pythonlab',
          predictResponse: predictResponse,
        })
      );
    }
  };

  return (
    <div className={moduleStyles.pythonlab}>
      {source && (
        <Codebridge
          project={source}
          config={config}
          setProject={setSource}
          setConfig={setConfig}
          startSource={startSource}
          onRun={onRun}
          onStop={stopPythonCode}
          projectVersion={projectVersion}
        />
      )}
    </div>
  );
};

export default PythonlabView;
