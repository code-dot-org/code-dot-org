/* eslint-disable import/order */
import React, {useState} from 'react';

import './styles/Weblab2View.css';

import {Config} from './Config';

import {CDOIDE, ConfigType, ProjectType} from 'cdo-ide-poc';

import CDOEditor from './Editor';

const instructions = `Add html pages and preview them in the right pane.

Add css pages (and link them to your html).

Add javascript files (ending in .js) and execute javascript code in the right pane.

Use the file browser to add/rename/delete files, or to add/rename/delete folders (including hierarchically!)`;

const defaultConfig: ConfigType = {
  showSideBar: true,
  showPreview: true,
  showRunBar: true,
  showDebug: true,
  activeLeftNav: 'Files',
  EditorComponent: CDOEditor,
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
  sideBar: ['fa-circle-question', 'fa-folder'],
  instructions,
};

const defaultProject: ProjectType = {
  folders: {
    '1': {id: '1', name: 'foo', parentId: '0'},
    '2': {id: '2', name: 'bar', parentId: '1'},
    '3': {id: '3', name: 'baz', parentId: '0'},
    '4': {id: '4', name: 'f1', parentId: '1'},
    '5': {id: '5', name: 'f2', parentId: '1'},
    '6': {id: '6', name: 'b1', parentId: '2'},
  },
  files: {
    '1': {
      id: '1',
      name: 'index.html',
      language: 'html',
      contents: `<!DOCTYPE html><html>
  <link rel="stylesheet" href="styles.css"/>
  <body>
    Content goes here!
    <div class="foo">Foo class!</div>
  </body>
</html>
`,
      open: true,
      active: true,
      folderId: '0',
    },
    '2': {
      id: '2',
      name: 'styles.css',
      language: 'css',
      contents: '.foo { color : red}',
      open: true,
      folderId: '0',
    },
    '3': {
      id: '3',
      name: 'page.html',
      language: 'html',
      contents:
        '<!DOCTYPE html><html><body>This is a separate html page</body></html>',
      open: false,
      folderId: '0',
    },
    '4': {
      id: '4',
      name: 'test4.html',
      language: 'html',
      contents:
        '<!DOCTYPE html><html><body>This is a sub folder html page</body></html>',
      open: false,
      folderId: '2',
    },
    '5': {
      id: '5',
      name: 'test5.html',
      language: 'html',
      contents:
        '<!DOCTYPE html><html><body>This is a sub folder html page</body></html>',
      open: false,
      folderId: '4',
    },
    '6': {
      id: '6',
      name: 'test6-1.html',
      language: 'html',
      contents:
        '<!DOCTYPE html><html><body>This is a sub folder html page</body></html>',
      open: false,
      folderId: '1',
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
