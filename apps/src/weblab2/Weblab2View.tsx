// Making sure that css is first so that it is imported for other classes.
// This might not be necessary.
import './styles/Weblab2View.css'; // eslint-disable-line import/order

import {Codebridge} from '@codebridge/Codebridge';
import {ConfigType, ProjectType} from '@codebridge/types';
import {css} from '@codemirror/lang-css';
import {html} from '@codemirror/lang-html';
import {LanguageSupport} from '@codemirror/language';
import React, {useState} from 'react';

import {ProjectSources} from '@cdo/apps/lab2/types';

import {useSource} from '../codebridge/hooks/useSource';

import {Config} from './Config';

const weblabLangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
};

const labeledGridLayouts = {
  horizontal: {
    gridLayoutRows: '300px minmax(0, 1fr)',
    gridLayoutColumns: '300px minmax(0, 1fr) 1fr',
    gridLayout: `
    "info-panel workspace preview-container"
    "file-browser workspace preview-container"`,
  },
  vertical: {
    gridLayoutRows: '300px minmax(0, 1fr) 1fr',
    gridLayoutColumns: '300px minmax(0, 1fr) 1fr',
    gridLayout: `
    "info-panel workspace workspace"
    "file-browser workspace workspace"
    "file-browser preview-container preview-container"`,
  },
};

const defaultConfig: ConfigType = {
  activeLeftNav: 'Files',
  languageMapping: weblabLangMapping,
  editableFileTypes: ['html', 'css'],
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

  labeledGridLayouts,
  activeGridLayout: 'horizontal',
  showFileBrowser: true,
};

const defaultSource: ProjectType = {
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

const defaultProject: ProjectSources = {source: defaultSource};

const Weblab2View = () => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {source, setSource, startSource, projectVersion} =
    useSource(defaultProject);
  const [showConfig, setShowConfig] = useState<
    'project' | 'config' | 'layout' | ''
  >('');

  const configKey = {
    project: source || defaultProject,
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
      </div>
      <div className="app-ide">
        {source && (
          <Codebridge
            project={source}
            config={config}
            setProject={setSource}
            setConfig={setConfig}
            startSource={startSource}
            projectVersion={projectVersion}
          />
        )}

        {showConfig && (
          <Config
            config={configKey[showConfig]}
            setConfig={(
              configName: string,
              newConfig: ProjectType | ConfigType | string
            ) => {
              if (configName === 'project') {
                setSource(newConfig as ProjectType);
              } else if (configName === 'config' || configName === 'layout') {
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
