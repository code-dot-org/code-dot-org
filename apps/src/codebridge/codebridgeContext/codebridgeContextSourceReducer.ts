import {ReducerAction, FileId, FolderId} from '@codebridge/types';
import {sortFilesByName, getOpenFileIds} from '@codebridge/utils';

import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import {SOURCE_REDUCER_ACTIONS} from './constants';
import {
  findFiles,
  findSubFolders,
  getNextFileId,
  getNextFolderId,
} from './utils';
type DefaultFilePayload = {
  fileId: FileId;
};

type DefaultFolderPayload = {
  folderId: FolderId;
};

export const sourceReducer = (
  source: MultiFileSource,
  action: ReducerAction
): MultiFileSource => {
  switch (action.type) {
    case SOURCE_REDUCER_ACTIONS.REPLACE_SOURCE: {
      const {source: newSource} = action.payload as {
        source: MultiFileSource;
      };
      return newSource;
    }
    case SOURCE_REDUCER_ACTIONS.NEW_FILE: {
      const {fileName, folderId, contents = '', validationFileId} = <
        DefaultFilePayload & {
          fileName: string;
          contents?: string;
          folderId: FolderId;
          validationFileId?: string;
        }
      >action.payload;

      const fileId = getNextFileId(
        Object.values(source.files),
        validationFileId
      );

      const newSource = {...source, files: {...source.files}};

      const [, extension] = fileName.split('.');

      newSource.files[fileId] = {
        id: fileId,
        name: fileName,
        language: extension || 'html',
        contents,

        folderId,
      };

      return sourceReducer(newSource, {
        type: SOURCE_REDUCER_ACTIONS.ACTIVATE_FILE,
        payload: {fileId},
      });
    }

    case SOURCE_REDUCER_ACTIONS.RENAME_FILE: {
      const {fileId, newName} = <DefaultFilePayload & {newName: string}>(
        action.payload
      );
      return {
        ...source,
        files: {
          ...source.files,
          [fileId]: {...source.files[fileId], name: newName},
        },
      };
    }

    case SOURCE_REDUCER_ACTIONS.SAVE_FILE: {
      const {fileId, contents} = <DefaultFilePayload & {contents: string}>(
        action.payload
      );

      if (source.files[fileId].contents === contents) {
        return source;
      }

      return {
        ...source,
        files: {
          ...source.files,
          [fileId]: {...source.files[fileId], contents},
        },
      };
    }

    case SOURCE_REDUCER_ACTIONS.SET_FILE_TYPE: {
      const {fileId, type} = <DefaultFilePayload & {type: ProjectFileType}>(
        action.payload
      );

      return {
        ...source,
        files: {
          ...source.files,
          [fileId]: {...source.files[fileId], type},
        },
      };
    }

    // OPEN_FILE does exactly the same thing as ACTIVATE_FILE, at least for now.
    case SOURCE_REDUCER_ACTIONS.OPEN_FILE:
    case SOURCE_REDUCER_ACTIONS.ACTIVATE_FILE: {
      const {fileId} = <DefaultFilePayload>action.payload;
      const activeFile = getActiveFileForSource(source);

      // if this file is already active, then no change.
      if (activeFile?.id === fileId && activeFile.active) {
        return source;
      }

      const newOpenFileIds = getOpenFileIds(source);
      if (!newOpenFileIds.find(openFileId => openFileId === fileId)) {
        newOpenFileIds.push(fileId);
      }

      const newSource = {
        ...source,
        files: {
          ...source.files,
          [fileId]: {...source.files[fileId], active: true, open: true},
        },
        openFiles: newOpenFileIds,
      };

      if (activeFile) {
        newSource.files[activeFile.id] = {
          ...newSource.files[activeFile.id],
          active: false,
        };
      }

      return newSource;
    }

    case SOURCE_REDUCER_ACTIONS.CLOSE_FILE: {
      const {fileId} = <DefaultFilePayload>action.payload;

      const file = source.files[fileId];

      const newSource = {
        ...source,
        files: {
          ...source.files,
          [fileId]: {...source.files[fileId], open: false, active: false},
        },
        openFiles: source.openFiles?.filter(
          openFileId => openFileId !== fileId
        ),
      };

      // if the file -was- active, then we want to activate whatever file was next to it.
      // choose the recent file before hand if possible, and otherwise after. Alphabetically sorted.
      if (file.active) {
        // so we look to our list of open files before we closed.
        const oldSortedFiles = sortFilesByName(source.files, {
          mustBeOpen: true,
        });
        // and find our index.
        const fileIdx = oldSortedFiles.findIndex(f => f.id === file.id)!;
        // if there's a file before us, we're gtg. Use that one.

        let newActiveFileId;
        if (fileIdx > 0) {
          newActiveFileId = oldSortedFiles[fileIdx - 1].id;
        }
        // otherwise, check to see if there's a file after us. And if so, use that one.
        // remember - we're removing this file from our list, so we have one fewer item in the list.
        // so we need to decrement by 1
        else if (fileIdx < oldSortedFiles.length - 1) {
          newActiveFileId = oldSortedFiles[fileIdx + 1].id;
        }

        if (newActiveFileId) {
          newSource.files[newActiveFileId] = {
            ...newSource.files[newActiveFileId],
            active: true,
          };
        }
      }

      return newSource;
    }

    case SOURCE_REDUCER_ACTIONS.DELETE_FILE: {
      const {fileId} = <DefaultFilePayload>action.payload;

      const openFileIds = getOpenFileIds(source);
      const newOpenFileIds = openFileIds.find(
        openFileId => openFileId === fileId
      )
        ? openFileIds.filter(openFileId => openFileId !== fileId)
        : openFileIds;

      const newSource = {
        ...source,
        files: {
          ...source.files,
        },
        openFiles: newOpenFileIds,
      };

      delete newSource.files[fileId];

      return newSource;
    }

    case SOURCE_REDUCER_ACTIONS.MOVE_FILE: {
      const {fileId, folderId} = <DefaultFilePayload & {folderId: FolderId}>(
        action.payload
      );
      return {
        ...source,
        files: {
          ...source.files,
          [fileId]: {...source.files[fileId], folderId},
        },
      };
    }

    case SOURCE_REDUCER_ACTIONS.MOVE_FOLDER: {
      const {folderId, parentId} = <
        DefaultFolderPayload & {parentId: FolderId}
      >action.payload;

      if (folderId === parentId) {
        return source;
      }

      return {
        ...source,
        folders: {
          ...source.folders,
          [folderId]: {...source.folders[folderId], parentId},
        },
      };
    }

    case SOURCE_REDUCER_ACTIONS.NEW_FOLDER: {
      const {folderName, parentId} = <
        DefaultFolderPayload & {
          folderName: string;
          parentId: string;
        }
      >action.payload;

      const folderId = getNextFolderId(Object.values(source.folders));

      const newSource = {...source, folders: {...source.folders}};

      newSource.folders[folderId] = {
        id: folderId,
        name: folderName,
        parentId,
      };

      return newSource;
    }

    case SOURCE_REDUCER_ACTIONS.TOGGLE_OPEN_FOLDER: {
      const {folderId} = <DefaultFolderPayload>action.payload;
      return {
        ...source,
        folders: {
          ...source.folders,
          [folderId]: {
            ...source.folders[folderId],
            open: !source.folders[folderId].open,
          },
        },
      };
    }
    case SOURCE_REDUCER_ACTIONS.DELETE_FOLDER: {
      const {folderId} = <DefaultFolderPayload>action.payload;
      const newSource = {
        ...source,
        folders: {
          ...source.folders,
        },
      };

      const subFolders = new Set(
        findSubFolders(folderId, Object.values(source.folders))
      );
      const files = new Set(
        findFiles(
          folderId,
          Object.values(source.files),
          Object.values(source.folders)
        )
      );

      // delete the folder
      delete newSource.folders[folderId];

      // delete all its child folders
      Object.values(newSource.folders)
        .filter(f => subFolders.has(f.id))
        .forEach(f => delete newSource.folders[f.id]);

      // and delete all files housed within this or any child folder
      if (files.size) {
        newSource.files = {...newSource.files};
        Object.values(newSource.files)
          .filter(f => files.has(f.id))
          .forEach(f => delete newSource.files[f.id]);
        if (newSource.openFiles) {
          // Delete files from the list of open files.
          newSource.openFiles = newSource.openFiles.filter(
            fileId => !files.has(fileId)
          );
        }
      }

      return newSource;
    }

    case SOURCE_REDUCER_ACTIONS.RENAME_FOLDER: {
      const {folderId, newName} = <DefaultFolderPayload & {newName: string}>(
        action.payload
      );
      return {
        ...source,
        folders: {
          ...source.folders,
          [folderId]: {...source.folders[folderId], name: newName},
        },
      };
    }

    case SOURCE_REDUCER_ACTIONS.REARRANGE_FILES: {
      const {fileIds} = <{fileIds: FileId[]}>action.payload;
      return {
        ...source,
        openFiles: fileIds,
      };
    }

    default:
      return source;
  }
};
