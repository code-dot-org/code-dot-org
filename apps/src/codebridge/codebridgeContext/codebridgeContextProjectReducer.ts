import {ProjectType, ReducerAction, FileId, FolderId} from '@codebridge/types';
import {sortFilesByName, getOpenFileIds} from '@codebridge/utils';

import {getActiveFileForProject} from '@cdo/apps/lab2/projects/utils';
import {ProjectFileType} from '@cdo/apps/lab2/types';

import {PROJECT_REDUCER_ACTIONS} from './constants';
import {findFiles, findSubFolders} from './utils';
type DefaultFilePayload = {
  fileId: FileId;
};

type DefaultFolderPayload = {
  folderId: FolderId;
};

export const projectReducer = (project: ProjectType, action: ReducerAction) => {
  switch (action.type) {
    case PROJECT_REDUCER_ACTIONS.REPLACE_PROJECT: {
      const {project: newProject} = action.payload as {
        project: ProjectType;
      };
      return newProject;
    }
    case PROJECT_REDUCER_ACTIONS.NEW_FILE: {
      const {fileId, fileName, folderId, contents = ''} = <
        DefaultFilePayload & {
          fileName: string;
          contents?: string;
          folderId: FolderId;
        }
      >action.payload;

      const newProject = {...project, files: {...project.files}};

      /* eslint-disable-next-line */
      const [_, extension] = fileName.split('.');

      newProject.files[fileId] = {
        id: fileId,
        name: fileName,
        language: extension || 'html',
        contents,

        folderId,
      };

      return newProject;
    }

    case PROJECT_REDUCER_ACTIONS.RENAME_FILE: {
      const {fileId, newName} = <DefaultFilePayload & {newName: string}>(
        action.payload
      );
      return {
        ...project,
        files: {
          ...project.files,
          [fileId]: {...project.files[fileId], name: newName},
        },
      };
    }

    case PROJECT_REDUCER_ACTIONS.SAVE_FILE: {
      const {fileId, contents} = <DefaultFilePayload & {contents: string}>(
        action.payload
      );

      if (project.files[fileId].contents === contents) {
        return project;
      }

      return {
        ...project,
        files: {
          ...project.files,
          [fileId]: {...project.files[fileId], contents},
        },
      };
    }

    case PROJECT_REDUCER_ACTIONS.SET_FILE_TYPE: {
      const {fileId, type} = <DefaultFilePayload & {type: ProjectFileType}>(
        action.payload
      );

      return {
        ...project,
        files: {
          ...project.files,
          [fileId]: {...project.files[fileId], type},
        },
      };
    }

    // OPEN_FILE does exactly the same thing as ACTIVATE_FILE, at least for now.
    case PROJECT_REDUCER_ACTIONS.OPEN_FILE:
    case PROJECT_REDUCER_ACTIONS.ACTIVATE_FILE: {
      const {fileId} = <DefaultFilePayload>action.payload;
      const activeFile = getActiveFileForProject(project);

      // if this file is already active, then no change.
      if (activeFile?.id === fileId && activeFile.active) {
        return project;
      }

      const newOpenFileIds = getOpenFileIds(project);
      if (!newOpenFileIds.find(openFileId => openFileId === fileId)) {
        newOpenFileIds.push(fileId);
      }

      const newProject = {
        ...project,
        files: {
          ...project.files,
          [fileId]: {...project.files[fileId], active: true, open: true},
        },
        openFiles: newOpenFileIds,
      };

      if (activeFile) {
        newProject.files[activeFile.id] = {
          ...newProject.files[activeFile.id],
          active: false,
        };
      }

      return newProject;
    }

    case PROJECT_REDUCER_ACTIONS.CLOSE_FILE: {
      const {fileId} = <DefaultFilePayload>action.payload;

      const file = project.files[fileId];

      const newProject = {
        ...project,
        files: {
          ...project.files,
          [fileId]: {...project.files[fileId], open: false, active: false},
        },
        openFiles: project.openFiles?.filter(
          openFileId => openFileId !== fileId
        ),
      };

      // if the file -was- active, then we want to activate whatever file was next to it.
      // choose the recent file before hand if possible, and otherwise after. Alphabetically sorted.
      if (file.active) {
        // so we look to our list of open files before we closed.
        const oldSortedFiles = sortFilesByName(project.files, {
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
          newProject.files[newActiveFileId] = {
            ...newProject.files[newActiveFileId],
            active: true,
          };
        }
      }

      return newProject;
    }

    case PROJECT_REDUCER_ACTIONS.DELETE_FILE: {
      const {fileId} = <DefaultFilePayload>action.payload;

      const openFileIds = getOpenFileIds(project);
      const newOpenFileIds = openFileIds.find(
        openFileId => openFileId === fileId
      )
        ? openFileIds.filter(openFileId => openFileId !== fileId)
        : openFileIds;

      const newProject = {
        ...project,
        files: {
          ...project.files,
        },
        openFiles: newOpenFileIds,
      };

      delete newProject.files[fileId];

      return newProject;
    }

    case PROJECT_REDUCER_ACTIONS.MOVE_FILE: {
      const {fileId, folderId} = <DefaultFilePayload & {folderId: FolderId}>(
        action.payload
      );
      return {
        ...project,
        files: {
          ...project.files,
          [fileId]: {...project.files[fileId], folderId},
        },
      };
    }

    case PROJECT_REDUCER_ACTIONS.NEW_FOLDER: {
      const {folderId, folderName, parentId} = <
        DefaultFolderPayload & {
          folderName: string;
          parentId: string;
        }
      >action.payload;

      const newProject = {...project, folders: {...project.folders}};

      newProject.folders[folderId] = {
        id: folderId,
        name: folderName,
        parentId,
      };

      return newProject;
    }

    case PROJECT_REDUCER_ACTIONS.TOGGLE_OPEN_FOLDER: {
      const {folderId} = <DefaultFolderPayload>action.payload;
      return {
        ...project,
        folders: {
          ...project.folders,
          [folderId]: {
            ...project.folders[folderId],
            open: !project.folders[folderId].open,
          },
        },
      };
    }
    case PROJECT_REDUCER_ACTIONS.DELETE_FOLDER: {
      const {folderId} = <DefaultFolderPayload>action.payload;
      const newProject = {
        ...project,
        folders: {
          ...project.folders,
        },
      };

      const subFolders = new Set(
        findSubFolders(folderId, Object.values(project.folders))
      );
      const files = new Set(
        findFiles(
          folderId,
          Object.values(project.files),
          Object.values(project.folders)
        )
      );

      // delete the folder
      delete newProject.folders[folderId];

      // delete all its child folders
      Object.values(newProject.folders)
        .filter(f => subFolders.has(f.id))
        .forEach(f => delete newProject.folders[f.id]);

      // and delete all files housed within this or any child folder
      if (files.size) {
        newProject.files = {...newProject.files};
        Object.values(newProject.files)
          .filter(f => files.has(f.id))
          .forEach(f => delete newProject.files[f.id]);
      }

      return newProject;
    }

    case PROJECT_REDUCER_ACTIONS.RENAME_FOLDER: {
      const {folderId, newName} = <DefaultFolderPayload & {newName: string}>(
        action.payload
      );
      return {
        ...project,
        folders: {
          ...project.folders,
          [folderId]: {...project.folders[folderId], name: newName},
        },
      };
    }

    case PROJECT_REDUCER_ACTIONS.REARRANGE_FILES: {
      const {fileIds} = <{fileIds: FileId[]}>action.payload;
      return {
        ...project,
        openFiles: fileIds,
      };
    }

    default:
      return project;
  }
};
