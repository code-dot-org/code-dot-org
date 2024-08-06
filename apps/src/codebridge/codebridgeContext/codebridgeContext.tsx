import React, {createContext, useContext} from 'react';

import {setFileType} from '../FileBrowser/types';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
  OnRunFunction,
  SourceType,
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
  RenameFolderFunction,
  RearrangeFilesFunction,
} from './types';

type CodebridgeContextType = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
  onRun?: OnRunFunction;
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
  renameFolder: RenameFolderFunction;
  setFileType: setFileType;
  rearrangeFiles: RearrangeFilesFunction;
  startSource: SourceType;
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
