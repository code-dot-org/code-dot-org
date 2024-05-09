// Pythonlab view
import React, {useState} from 'react';
import moduleStyles from './pythonlab-view.module.scss';
import {ConfigType} from '@codebridge/types';
import {LanguageSupport} from '@codemirror/language';
import {python} from '@codemirror/lang-python';
import {Codebridge} from '@codebridge/Codebridge';
import {ProjectSources} from '@cdo/apps/lab2/types';
import PythonConsole from './PythonConsole';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {useSource} from '../codebridge/hooks/useSource';

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
  },
};

const defaultConfig: ConfigType = {
  activeLeftNav: 'Files',
  languageMapping: pythonlabLangMapping,
  allowedLanguages: ['py', 'csv', 'txt'],
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
    "instructions workspace"
    "instructions workspace"
    "file-browser workspace"
  `,
};

const PythonlabView: React.FunctionComponent = () => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {source, setSource, resetToStartSource} = useSource(defaultProject);

  return (
    <div className={moduleStyles.pythonlab}>
      <div className={moduleStyles.editor}>
        {source && (
          <Codebridge
            project={source}
            config={config}
            setProject={setSource}
            setConfig={setConfig}
            resetProject={resetToStartSource}
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
