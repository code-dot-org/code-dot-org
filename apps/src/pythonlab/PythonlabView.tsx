// Pythonlab view
import React, {useEffect, useState} from 'react';
import moduleStyles from './pythonlab-view.module.scss';
import {ConfigType} from '@cdo/apps/weblab2/CDOIDE/types';
import Editor from '../weblab2/CDOIDE/CenterPane/Editor';
import {LanguageSupport} from '@codemirror/language';
import {python} from '@codemirror/lang-python';
import {CDOIDE} from '../weblab2/CDOIDE';
import {MultiFileSource} from '../lab2/types';
import Lab2Registry from '../lab2/Lab2Registry';
import {useAppSelector} from '../util/reduxHooks';

const pythonlabLangMapping: {[key: string]: LanguageSupport} = {
  python: python(),
};

const defaultProject: MultiFileSource = {
  files: {
    '0': {
      id: '0',
      name: 'main.py',
      language: 'python',
      contents: 'print("Hello world!")',
      folderId: '1',
      active: true,
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
  //showSideBar: true,
  // showLeftNav: false,
  // showEditor: false,
  showPreview: false,
  activeLeftNav: 'Files',
  EditorComponent: () => Editor(pythonlabLangMapping, ['python']),
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
  instructions: 'Welcome to Python Lab!',
};

const PythonlabView: React.FunctionComponent = () => {
  const [currentProject, setCurrentProject] =
    useState<MultiFileSource>(defaultProject);
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const initialSources = useAppSelector(state => state.lab.initialSources);
  const channelId = useAppSelector(state => state.lab.channel?.id);

  const setProject = (newProject: MultiFileSource) => {
    setCurrentProject(newProject);
    if (Lab2Registry.getInstance().getProjectManager()) {
      const projectSources = {
        source: newProject,
      };
      Lab2Registry.getInstance().getProjectManager()?.save(projectSources);
    }
  };

  useEffect(() => {
    // We reset the project when the channelId changes, as this means we are on a new level.
    console.log({initialSources, channelId});
    // if (initialSources?.source) {
    //   // backwards compatibility: add active flag to first file if no file is active
    //   let hasActiveFile = false;
    //   const files = (initialSources.source as MultiFileSource).files;
    //   Object.values(files).forEach(file => {
    //     if (file.active) {
    //       hasActiveFile = true;
    //     }
    //   });
    //   if (!hasActiveFile && files) {
    //     const firstKey = Object.keys(files)[0];
    //     console.log(`setting ${firstKey} as active`);
    //     files[firstKey].active = true;
    //     console.log({files});
    //   }
    //   console.log({source: initialSources});
    // }
    console.log({initialSources});
    setCurrentProject(
      (initialSources?.source as MultiFileSource) || defaultProject
    );
  }, [channelId, initialSources]);

  return (
    <div className={moduleStyles.pythonlab}>
      <CDOIDE
        project={currentProject}
        config={config}
        setProject={setProject}
        setConfig={setConfig}
      />
    </div>
  );
};

export default PythonlabView;
