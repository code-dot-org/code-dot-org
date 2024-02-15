import React from 'react';
import './styles/center-pane.css';

import {useCDOIDEContext} from '../CDOIDEContext';

import {FileNav} from './FileNav';
import {Debugger} from './Debugger';
import {Editor} from './Editor';

import {
  SaveFileFunction,
  CloseFileFunction,
  SetActiveFileFunction,
} from './types';

export const CenterPane = () => {
  const {config, project, setProject} = useCDOIDEContext();

  const saveFile: SaveFileFunction = (fileName, contents) => {
    setProject({
      ...project,
      files: {
        ...project.files,
        [fileName]: {...project.files[fileName], contents},
      },
    });
  };

  const closeFile: CloseFileFunction = fileName => {
    setProject({
      ...project,
      files: {
        ...project.files,
        [fileName]: {...project.files[fileName], open: false},
      },
    });
  };

  const setActiveFile: SetActiveFileFunction = fileName => {
    const activeFile = Object.values(project.files).filter(f => f.active)?.[0];

    const newProject = {
      ...project,
      files: {
        ...project.files,
        [fileName]: {...project.files[fileName], active: true},
        [activeFile.name]: {...project.files[activeFile.name], active: false},
      },
    };

    if (activeFile) {
      newProject.files[activeFile.name].active = false;
    }

    if (activeFile?.name !== fileName) {
      console.log('ACTIVE : ', newProject);
      setProject(newProject);
    }
  };

  return (
    <div
      className="center-pane"
      style={{
        gridTemplateRows: config.showDebug ? '32px 1fr 1fr' : '32px auto',
      }}
    >
      <div className="center-nav">
        <FileNav setActiveFile={setActiveFile} closeFile={closeFile} />
      </div>
      <div className="center-main">
        <Editor saveFile={saveFile} />
      </div>
      {config.showDebug && <Debugger />}
    </div>
  );
};
