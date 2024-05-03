// Pythonlab view
import React, {useEffect, useMemo, useRef, useState} from 'react';
import moduleStyles from './pythonlab-view.module.scss';
import {ConfigType} from '@cdo/apps/weblab2/CDOIDE/types';
import {Editor} from '@cdo/apps/weblab2/CDOIDE/Editor';
import {LanguageSupport} from '@codemirror/language';
import {python} from '@codemirror/lang-python';
import {CDOIDE} from '@cdo/apps/weblab2/CDOIDE';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {setAndSaveSource, setSource} from './pythonlabRedux';
import PythonConsole from './PythonConsole';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import getScriptData from '@cdo/apps/util/getScriptData';
import {PartialAppOptions} from '../lab2/projects/utils';
import header from '@cdo/apps/code-studio/header';
import {LabState} from '../lab2/lab2Redux';

const pythonlabLangMapping: {[key: string]: LanguageSupport} = {
  py: python(),
};

const defaultProject: MultiFileSource = {
  files: {
    '0': {
      id: '0',
      name: MAIN_PYTHON_FILE,
      language: 'py',
      contents: 'print("Hello world!")',
      folderId: '1',
      active: true,
      open: true,
    },
  },
  folders: {
    '1': {
      id: '1',
      name: 'src',
      parentId: '0',
    },
  },
};

const defaultSources: ProjectSources = {
  source: defaultProject,
};

const selectInitialSources = (labState: LabState, isStartMode: boolean) => {
  // Get the start sources from the level or use our hard-coded default.
  const startSources = labState.levelProperties?.source
    ? labState.levelProperties
    : defaultSources;
  if (isStartMode) {
    return startSources;
  }
  const projectSources = labState.initialSources;
  // projectSources will be undefined if the user hasn't begun a project.
  return projectSources || startSources;
};

const defaultConfig: ConfigType = {
  activeLeftNav: 'Files',
  EditorComponent: () => Editor(pythonlabLangMapping, ['py', 'csv', 'txt']),
  leftNav: [
    {
      icon: 'fa-square-check',
      component: 'Instructions',
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
  gridLayoutRows: '32px 232px auto',
  gridLayoutColumns: '300px auto',
  gridLayout: `
    "instructions file-tabs"
    "instructions editor"
    "file-browser editor"
  `,
};

const PythonlabView: React.FunctionComponent = () => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const appOptions = getScriptData('appoptions') as PartialAppOptions;
  const isStartMode = appOptions.editBlocks === 'start_sources';
  const initialSources = useAppSelector(state =>
    selectInitialSources(state.lab, isStartMode)
  );
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const dispatch = useAppDispatch();
  const source = useAppSelector(state => state.pythonlab.source);
  const sourceRef = useRef(source); // useRef to hold the current source

  // TODO: This is (mostly) repeated in Weblab2View. Can we extract this out somewhere?
  // https://codedotorg.atlassian.net/browse/CT-499
  const setProject = useMemo(
    () => (newProject: MultiFileSource) => {
      dispatch(setAndSaveSource(newProject));
    },
    [dispatch]
  );

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => {
        return {source: sourceRef.current};
      });
    }
  }, [isStartMode]);

  useEffect(() => {
    // We reset the project when the channelId changes, as this means we are on a new level.
    dispatch(setSource(initialSources?.source as MultiFileSource));
  }, [channelId, dispatch, initialSources]);

  return (
    <div className={moduleStyles.pythonlab}>
      <div className={moduleStyles.editor}>
        {source && (
          <CDOIDE
            project={source}
            config={config}
            setProject={setProject}
            setConfig={setConfig}
          />
        )}
      </div>
      {/** TODO: Should the console be a part of CDOIDE? */}
      <div className={moduleStyles.console}>
        <PythonConsole />
      </div>
    </div>
  );
};

export default PythonlabView;
