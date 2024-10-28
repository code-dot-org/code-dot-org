import {
  ProjectType,
  ProjectFile,
  ProjectFolder,
  ReducerAction,
} from '@codebridge/types';
import {useMemo} from 'react';

// disabling locales and falling back on the hardwired default due to apparent circular dep
// import codebridgeI18n from '@cdo/apps/codebridge/locale';
const DEFAULT_NEW_FILE_CONTENTS = 'Add your changes to ${fileName}';

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
  MoveFolderFunction,
  NewFolderFunction,
  RearrangeFilesFunction,
  RenameFolderFunction,
  ToggleOpenFolderFunction,
  DeleteFolderFunction,
  SetFileTypeFunction,
} from './types';

// optionally, we can hand in the validationFileId as the second argument. If it's included, then we'll use that as well
// when we figure out the next file id. If we're not given one, then just set it to '0' so it doesn't interfere with id generation.
export const getNextFileId = (files: ProjectFile[], validationFileId = '0') => {
  return String(
    Math.max(0, Number(validationFileId), ...files.map(f => Number(f.id))) + 1
  );
};

export const getNextFolderId = (folders: ProjectFolder[]) => {
  return String(Math.max(0, ...folders.map(f => Number(f.id))) + 1);
};

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
      replaceProject: <ReplaceProjectFunction>((project: ProjectType) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.REPLACE_PROJECT,
          payload: {project},
        });
      }),
      newFile: <NewFileFunction>(({
        fileName,
        folderId = DEFAULT_FOLDER_ID,
        // this line causes the apparent circular dependency issue
        // contents = codebridgeI18n.defaultNewFileContents({fileName}),
        contents = DEFAULT_NEW_FILE_CONTENTS,
      }) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.NEW_FILE,
          payload: {
            fileName,
            folderId,
            contents: contents.replace(/\${fileName}/g, fileName),
          },
        });
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
      moveFolder: <MoveFolderFunction>((folderId, parentId) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.MOVE_FOLDER,
          payload: {folderId, parentId},
        });
      }),

      setFileType: <SetFileTypeFunction>((fileId, type) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.SET_FILE_TYPE,
          payload: {fileId, type},
        });
      }),

      newFolder: <NewFolderFunction>(({
        folderName,
        parentId = DEFAULT_FOLDER_ID,
      }) => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.NEW_FOLDER,
          payload: {folderName, parentId},
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
      rearrangeFiles: <RearrangeFilesFunction>(fileIds => {
        dispatch({
          type: PROJECT_REDUCER_ACTIONS.REARRANGE_FILES,
          payload: {fileIds},
        });
      }),
    };
    return utils;
  }, [dispatch]);
};
