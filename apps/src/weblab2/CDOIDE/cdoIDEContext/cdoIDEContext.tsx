import React, {createContext, useContext} from 'react';

import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
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
} from './types';

type CDOIDEContextType = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
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
};

export const CDOIDEContext = createContext<CDOIDEContextType | null>(null);

export const useCDOIDEContext = () => {
  const context = useContext(CDOIDEContext);
  if (context === null) {
    throw new Error('CDO IDE Context has not been provided!');
  }
  return context;
};

type CDOIDEContextProviderType = {
  children: React.ReactNode;
  value: CDOIDEContextType;
};

export const CDOIDEContextProvider = ({
  children,
  value,
}: CDOIDEContextProviderType) => (
  <CDOIDEContext.Provider value={value}>{children}</CDOIDEContext.Provider>
);
