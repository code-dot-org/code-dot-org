import React, {createContext, useContext} from 'react';

import {LabConfig, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';

import {setFileType} from '../FileBrowser/types';
import {
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
  OnRunFunction,
  OnStopFunction,
} from '../types';

import {
  SaveFileFunction,
  CloseFileFunction,
  SetActiveFileFunction,
  NewFolderFunction,
  ToggleOpenFolderFunction,
  DeleteFolderFunction,
  OpenFileFunction,
  DeleteFileFunction,
  NewFileFunction,
  RenameFileFunction,
  MoveFileFunction,
  MoveFolderFunction,
  RenameFolderFunction,
  RearrangeFilesFunction,
} from './types';

export type CodebridgeContextType = {
  source: MultiFileSource;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
  onRun?: OnRunFunction;
  onStop?: OnStopFunction;
  saveFile: SaveFileFunction;
  closeFile: CloseFileFunction;
  setActiveFile: SetActiveFileFunction;
  newFolder: NewFolderFunction;
  toggleOpenFolder: ToggleOpenFolderFunction;
  deleteFolder: DeleteFolderFunction;
  openFile: OpenFileFunction;
  deleteFile: DeleteFileFunction;
  newFile: NewFileFunction;
  renameFile: RenameFileFunction;
  moveFile: MoveFileFunction;
  moveFolder: MoveFolderFunction;
  renameFolder: RenameFolderFunction;
  setFileType: setFileType;
  rearrangeFiles: RearrangeFilesFunction;
  startSources: ProjectSources;
  labConfig?: LabConfig;
};

export const CodebridgeContext = createContext<CodebridgeContextType | null>(
  null
);

export const useCodebridgeContext = () => {
  const context = useContext(CodebridgeContext);
  if (context === null) {
    throw new Error('CDO IDE Context has not been provided!');
  }
  return context;
};

type CodebridgeContextProviderType = {
  children: React.ReactNode;
  value: CodebridgeContextType;
};

export const CodebridgeContextProvider = ({
  children,
  value,
}: CodebridgeContextProviderType) => (
  <CodebridgeContext.Provider value={value}>
    {children}
  </CodebridgeContext.Provider>
);
