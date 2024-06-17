// Pythonlab view
import React, {useState} from 'react';
import moduleStyles from './pythonlab-view.module.scss';
import {ConfigType} from '@codebridge/types';
import {LanguageSupport} from '@codemirror/language';
import {python} from '@codemirror/lang-python';
import {Codebridge} from '@codebridge/Codebridge';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {useSource} from '@codebridge/hooks/useSource';
import {handleRunClick} from './pyodideRunner';

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

  /*
  gridLayoutRows: '1fr 1fr 1fr 48px',
  gridLayoutColumns: '300px minmax(0, 1fr)',
  gridLayout: `
    "info-panel workspace"
    "file-browser workspace"
    "file-browser console"
    "file-browser control-buttons"
 `,
 */

  gridLayoutRows: '1fr',
  gridLayoutColumns: '1.2fr 0.8fr',
  gridLayout: '"workspace info-panel"',
};

const PythonlabView: React.FunctionComponent = () => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {source, setSource, resetToStartSource} = useSource(defaultProject);

  return (
    <div className={moduleStyles.pythonlab}>
      {source && (
        <Codebridge
          project={source}
          config={config}
          setProject={setSource}
          setConfig={setConfig}
          resetProject={resetToStartSource}
          onRun={handleRunClick}
        />
      )}
    </div>
  );
};

export default PythonlabView;
