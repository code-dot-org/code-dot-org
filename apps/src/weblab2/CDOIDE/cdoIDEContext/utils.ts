import {
  ProjectType,
  ProjectFile,
  ProjectFolder,
  ReducerAction,
} from '@cdoide/types';
import {useMemo} from 'react';

import {DEFAULT_FOLDER_ID} from '../constants';

import {PROJECT_REDUCER_ACTIONS} from './constants';
import {
  ReplaceProjectFunction,
  SaveFileFunction,
  NewFileFunction,
  RenameFileFunction,
  OpenFileFunction,
  CloseFileFunction,
  DeleteFileFunction,
  SetActiveFileFunction,
  MoveFileFunction,
  NewFolderFunction,
  RenameFolderFunction,
  ToggleOpenFolderFunction,
  DeleteFolderFunction,
} from './types';

const DEFAULT_NEW_FILE_CONTENTS = 'Add your changes to ${fileName}';

export const getNextFileId = (files: ProjectFile[]) =>
  String(Math.max(...files.map(f => Number(f.id))) + 1);

export const getNextFolderId = (folders: ProjectFolder[]) =>
  String(Math.max(...folders.map(f => Number(f.id))) + 1);

export const findSubFolders = (parentId: string, folders: ProjectFolder[]) =>
  folders.reduce((bucket, f: ProjectFolder) => {
    if (f.parentId === parentId) {
      bucket.push(f.id, ...findSubFolders(f.id, folders));
    }
    return bucket;
  }, <string[]>[]);

export const findFiles = (
  folderId: string,
  files: ProjectFile[],
  folders?: ProjectFolder[]
) => {
  const folderIds = new Set(
    folders ? [folderId, ...findSubFolders(folderId, folders)] : [folderId]
  );
  return files.reduce((bucket, f: ProjectFile) => {
    if (folderIds.has(f.folderId)) {
      bucket.push(f.id);
    }
    return bucket;
  }, <string[]>[]);
};

export const useProjectUtilities = (
  dispatch: React.Dispatch<ReducerAction>
) => {
  return useMemo(() => {
    const utils = {
      replaceProject: <ReplaceProjectFunction>((
        project: ProjectType,
        shouldNotifyProjectUpdate: {current: boolean}
      ) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.REPLACE_PROJECT,
          payload: {project, shouldNotifyProjectUpdate},
        });
      }),
      newFile: <NewFileFunction>(({
        fileId,
        fileName,
        folderId = DEFAULT_FOLDER_ID,
        contents = DEFAULT_NEW_FILE_CONTENTS,
      }) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.NEW_FILE,
          payload: {
            fileId,
            fileName,
            folderId,
            contents: contents.replace(/\${fileName}/g, fileName),
          },
        });
        utils.setActiveFile(fileId);
      }),
      renameFile: <RenameFileFunction>((fileId, newName) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.RENAME_FILE,
          payload: {fileId, newName},
        });
      }),
      saveFile: <SaveFileFunction>((fileId, contents) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.SAVE_FILE,
          payload: {fileId, contents},
        });
      }),
      openFile: <OpenFileFunction>(fileId => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.OPEN_FILE,
          payload: {fileId},
        });
      }),
      closeFile: <CloseFileFunction>(fileId => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.CLOSE_FILE,
          payload: {fileId},
        });
      }),
      deleteFile: <DeleteFileFunction>(fileId => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.DELETE_FILE,
          payload: {fileId},
        });
      }),
      setActiveFile: <SetActiveFileFunction>(fileId => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.ACTIVATE_FILE,
          payload: {fileId},
        });
      }),
      moveFile: <MoveFileFunction>((fileId, folderId) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.MOVE_FILE,
          payload: {fileId, folderId},
        });
      }),

      newFolder: <NewFolderFunction>(({
        folderId,
        folderName,
        parentId = DEFAULT_FOLDER_ID,
      }) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.NEW_FOLDER,
          payload: {folderId, folderName, parentId},
        });
      }),
      renameFolder: <RenameFolderFunction>((folderId, newName) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.RENAME_FOLDER,
          payload: {folderId, newName},
        });
      }),
      toggleOpenFolder: <ToggleOpenFolderFunction>(folderId => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.TOGGLE_OPEN_FOLDER,
          payload: {folderId},
        });
      }),
      deleteFolder: <DeleteFolderFunction>(folderId => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.DELETE_FOLDER,
          payload: {folderId},
        });
      }),
    };
    return utils;
  }, [dispatch]);
};
