import React, {useState} from 'react';

import './styles/Weblab2View.css';

import {Config} from './Config';

import {CDOIDE} from './CDOIDE/CDOIDE';
import {ConfigType, ProjectType} from './CDOIDE/types';

const defaultConfig: ConfigType = {
  showSideBar: true,
  showPreview: true,
  showRunBar: true,
  showDebug: true,
  activeLeftNav: 'Files',
  leftNav: [
    {
      icon: 'fa-square-check',
      component: 'Instructions',
    },
    {
      icon: 'fa-files',
      component: 'Files',
    },
    {
      icon: 'fa-magnifying-glass',
      component: 'Search',
    },
  ],
  sideBar: ['fa-circle-question', 'fa-folders'],
  instructions:
    'This is where some sort of instructions would go for this lesson',
};

const defaultProject: ProjectType = {
  folders: {
    '1': {id: '1', name: 'foo'},
    '2': {id: '2', name: 'bar', parentId: '1'},
    '3': {id: '3', name: 'baz'},
  },
  files: {
    'index.html': {
      name: 'index.html',
      language: 'html',
      contents: '<html><body>Content goes here!</body></html>',
      open: true,
      active: true,
    },
    'styles.css': {
      name: 'styles.css',
      language: 'css',
      contents: '.foo { color : red}',
      open: true,
    },
    'page.html': {
      name: 'page.html',
      language: 'html',
      contents: '<html><body>This is a separate html page</body></html>',
      open: false,
    },
  },
};

const App = () => {
  const [project, setProject] = useState<ProjectType>(defaultProject);
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const [showConfig, setShowConfig] = useState<'project' | 'config' | ''>('');

  return (
    <div className="app-wrapper">
      <div className="app-wrapper-nav">
        <button type="button" onClick={() => setShowConfig('project')}>
          Edit project
        </button>
        <button type="button" onClick={() => setShowConfig('config')}>
          Edit config
        </button>
      </div>
      <div className="app-ide">
        <CDOIDE
          project={project}
          config={config}
          setProject={setProject}
          setConfig={setConfig}
        />
      </div>
      {showConfig && (
        <Config
          config={showConfig === 'project' ? project : config}
          setConfig={(
            configName: string,
            newConfig: ProjectType | ConfigType
          ) => {
            if (configName === 'project') {
              setProject(newConfig as ProjectType);
            } else if (configName === 'config') {
              setConfig(newConfig as ConfigType);
            }
            setShowConfig('');
          }}
          cancelConfig={() => setShowConfig('')}
          configName={showConfig}
        />
      )}
    </div>
  );
};

export default App;
