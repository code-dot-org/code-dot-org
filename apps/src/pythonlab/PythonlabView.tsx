// Pythonlab view
import React, {useEffect, useMemo, useState} from 'react';
import moduleStyles from './pythonlab-view.module.scss';
import {ConfigType} from '@cdo/apps/weblab2/CDOIDE/types';
import {Editor} from '@cdo/apps/weblab2/CDOIDE/Editor';
import {LanguageSupport} from '@codemirror/language';
import {python} from '@codemirror/lang-python';
import {CDOIDE} from '@cdo/apps/weblab2/CDOIDE';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {setAndSaveSource, setSource} from './pythonlabRedux';
import PythonConsole from './PythonConsole';
import {MAIN_PYTHON_FILE, START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import header from '@cdo/apps/code-studio/header';
import {useInitialSources} from '@cdoide/hooks';

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
  const initialSources = useInitialSources({
    source: defaultProject,
  });
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const dispatch = useAppDispatch();
  const source = useAppSelector(state => state.pythonlab.source);

  // TODO: This is (mostly) repeated in Weblab2View. Can we extract this out somewhere?
  // https://codedotorg.atlassian.net/browse/CT-499
  const setProject = useMemo(
    () => (newProject: MultiFileSource) => {
      dispatch(setAndSaveSource(newProject));
    },
    [dispatch]
  );

  // When editing start sources, we provide a save button in the header.
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => {
        return {source};
      });
    }
  }, [isStartMode, source]);

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
