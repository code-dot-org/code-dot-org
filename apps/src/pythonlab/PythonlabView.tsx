// Pythonlab view
import React, {useState} from 'react';
import moduleStyles from './pythonlab-view.module.scss';
import {ConfigType} from '@codebridge/types';
import {LanguageSupport} from '@codemirror/language';
import {python} from '@codemirror/lang-python';
import {Codebridge} from '@codebridge/Codebridge';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {useSource} from '@codebridge/hooks/useSource';
import {handleRunClick} from './pyodideRunner';
import {AppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {sendPredictLevelReport} from '@cdo/apps/code-studio/progressRedux';
import {isPredictAnswerLocked} from '@cdo/apps/lab2/redux/predictLevelRedux';

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
  gridLayoutRows: '1fr 1fr 1fr 48px',
  gridLayoutColumns: '300px minmax(0, 1fr)',
  gridLayout: `
    "info-panel workspace"
    "file-browser workspace"
    "file-browser console"
    "file-browser control-buttons"
  `,
};

const PythonlabView: React.FunctionComponent = () => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {source, setSource, resetToStartSource} = useSource(defaultProject);
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);

  const onRun = (
    runTests: boolean,
    dispatch: AppDispatch,
    permissions: string[],
    source: MultiFileSource | undefined
  ) => {
    handleRunClick(runTests, dispatch, permissions, source);
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
          resetProject={resetToStartSource}
          onRun={onRun}
        />
      )}
    </div>
  );
};

export default PythonlabView;
