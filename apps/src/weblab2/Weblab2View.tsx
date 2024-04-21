import React, {useEffect, useState, useMemo} from 'react';

import './styles/Weblab2View.css';

import {Config} from './Config';

import {CDOIDE} from '@cdoide/CDOIDE';
import {ConfigType, ProjectType} from '@cdoide/types';

import CDOEditor from './CDOIDE/CenterPane/Editor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {html} from '@codemirror/lang-html';
import {LanguageSupport} from '@codemirror/language';
import {css} from '@codemirror/lang-css';

const instructions = `Add html pages and preview them in the right pane.

Add css pages (and link them to your html).

Use the file browser to add/rename/delete files, or to add/rename/delete folders (including hierarchically!)`;

const weblabLangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
};

const defaultConfig: ConfigType = {
  //showSideBar: true,
  // showLeftNav: false,
  // showEditor: false,
  // showPreview: false,
  activeLeftNav: 'Files',
  EditorComponent: () => CDOEditor(weblabLangMapping, ['html', 'css']),
  // editableFileTypes: ["html"],
  // previewFileTypes: ["html"],
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
  instructions,
  //editableFileTypes: ["html", "css"],
  //previewFileTypes: ["html"],
  /* PreviewComponents: {
    html: () => <div>I am previewing HTML</div>,
  }, */
  //blankEmptyEditor: true,
  //EmptyEditorComponent: () => <div>Nothing is open.</div>,
};

const defaultProject: ProjectType = {
  // folders: {},
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
    <div class="foo">[DEFAULT] Foo class!</div>
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

let lj = '';

const Weblab2View = () => {
  const [currentProject, setCurrentProject] =
    useState<ProjectType>(defaultProject);
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const [showConfig, setShowConfig] = useState<'project' | 'config' | ''>('');
  const initialSources = useAppSelector(state => state.lab.initialSources);
  const channelId = useAppSelector(state => state.lab.channel?.id);

  const setProject = useMemo(
    () => (newProject: MultiFileSource) => {
      const json = JSON.stringify(newProject);
      console.log('PROJ LENGTH : ', json.length);
      if (json.length < lj.length) {
        console.error('OMFG : ', json, lj);
      }
      lj = json;
      setCurrentProject(newProject);
      if (Lab2Registry.getInstance().getProjectManager()) {
        const projectSources = {
          source: newProject,
        };
        Lab2Registry.getInstance().getProjectManager()?.save(projectSources);
      }
    },
    [setCurrentProject]
  );

  useEffect(() => {
    // We reset the project when the channelId changes, as this means we are on a new level.
    setCurrentProject(
      (initialSources?.source as MultiFileSource) || defaultProject
    );
  }, [channelId, initialSources]);

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
          project={currentProject}
          config={config}
          setProject={setProject}
          setConfig={setConfig}
        />
      </div>
      {showConfig && (
        <Config
          config={showConfig === 'project' ? currentProject : config}
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

export default Weblab2View;
