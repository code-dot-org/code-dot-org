import React, {useEffect, useState, useMemo} from 'react';

import './styles/Weblab2View.css';

import {Config} from './Config';

import {CDOIDE} from '@cdoide/CDOIDE';
import {ConfigType, ProjectType} from '@cdoide/types';

import {Editor as CDOEditor} from './CDOIDE/Editor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {html} from '@codemirror/lang-html';
import {LanguageSupport} from '@codemirror/language';
import {css} from '@codemirror/lang-css';

const weblabLangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
};

const DefaultEditorComponent = () =>
  CDOEditor(weblabLangMapping, ['html', 'css']);

const horizontalLayout = {
  gridLayoutRows: '32px 300px auto',
  gridLayoutColumns: '300px auto auto',
  gridLayout: `    "instructions file-tabs preview-container"
      "instructions editor preview-container"
      "file-browser editor preview-container"`,
};

const verticalLayout = {
  gridLayoutRows: '32px 300px auto auto',
  gridLayoutColumns: '300px auto',
  gridLayout: `    "instructions file-tabs file-tabs"
      "instructions editor editor"
      "file-browser editor editor"
      "file-browser preview-container preview-container"`,
};

const defaultConfig: ConfigType = {
  activeLeftNav: 'Files',
  EditorComponent: DefaultEditorComponent,
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
  ...horizontalLayout,
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

const Weblab2View = () => {
  const [currentProject, setCurrentProject] =
    useState<ProjectType>(defaultProject);
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const [showConfig, setShowConfig] = useState<
    'project' | 'config' | 'layout' | ''
  >('');
  const initialSources = useAppSelector(state => state.lab.initialSources);
  const channelId = useAppSelector(state => state.lab.channel?.id);

  const setProject = useMemo(
    () => (newProject: MultiFileSource) => {
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

  const configKey = {
    project: currentProject,
    config: config,
    layout: config,
  };

  return (
    <div className="app-wrapper">
      <div className="app-wrapper-nav">
        <button type="button" onClick={() => setShowConfig('project')}>
          Edit project
        </button>
        <button type="button" onClick={() => setShowConfig('config')}>
          Edit config
        </button>
        <button type="button" onClick={() => setShowConfig('layout')}>
          Edit layout
        </button>
        <button
          type="button"
          onClick={() => setConfig({...config, ...horizontalLayout})}
        >
          Use horizontal layout
        </button>
        <button
          type="button"
          onClick={() => setConfig({...config, ...verticalLayout})}
        >
          Use vertical layout
        </button>
      </div>
      <div className="app-ide">
        <CDOIDE
          project={currentProject}
          config={config}
          setProject={setProject}
          setConfig={setConfig}
        />

        {showConfig && (
          <Config
            config={configKey[showConfig]}
            setConfig={(
              configName: string,
              newConfig: ProjectType | ConfigType | string
            ) => {
              if (configName === 'project') {
                setProject(newConfig as ProjectType);
              } else if (configName === 'config' || configName === 'layout') {
                (newConfig as ConfigType).EditorComponent =
                  DefaultEditorComponent;
                setConfig(newConfig as ConfigType);
              }
              setShowConfig('');
            }}
            cancelConfig={() => setShowConfig('')}
            configName={showConfig}
          />
        )}
      </div>
    </div>
  );
};

export default Weblab2View;
