import React, {createContext, useContext} from 'react';

import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
  OnRunFunction,
  ResetProjectFunction,
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
  SetFileVisibilityFunction,
  SetFileIsValidationFunction,
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
  setFileVisibility: SetFileVisibilityFunction;
  resetProject: ResetProjectFunction;
  setFileIsValidation: SetFileIsValidationFunction;
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
