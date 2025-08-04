import {DEFAULT_FOLDER_ID} from '@cdo/apps/codebridge/constants';
import {getOpenFileIds} from '@cdo/apps/codebridge/utils';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {
  FileId,
  FolderId,
  MultiFileSource,
  ProjectFile,
} from '@cdo/apps/lab2/types';

import {
  getNextFileId,
  getNextFolderId,
  findSubFolders,
  findFiles,
} from './multiFileSourceUtils';

// Helper functions for editing multi-file sources in lab2.

/**
 * Create a new file.
 */
export const createNewFileHelper = (
  source: MultiFileSource,
  fileName: string,
  folderId: FolderId = DEFAULT_FOLDER_ID,
  contents: string = ''
): MultiFileSource => {
  const fileId = getNextFileId(Object.values(source.files));
  const newSource = {...source, files: {...source.files}};
  const [, extension] = fileName.split('.');
  const defaultContents = `Add your changes to ${fileName}`;

  newSource.files[fileId] = {
    id: fileId,
    name: fileName,
    language: extension || 'html',
    contents: contents || defaultContents,
    folderId,
  };

  return activateFileHelper(newSource, fileId);
};
/**
 * Activate a file (make active).
 */
export const activateFileHelper = (
  source: MultiFileSource,
  fileId: FileId
): MultiFileSource => {
  const activeFile = getActiveFileForSource(source);

  // if this file is already active, then no change.
  if (activeFile?.id === fileId && activeFile.active) {
    return source;
  }

  const newOpenFileIds = getOpenFileIds(source);
  if (!newOpenFileIds.find(openFileId => openFileId === fileId)) {
    newOpenFileIds.push(fileId);
  }

  const newSource: MultiFileSource = {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...source.files[fileId], active: true},
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
};

/**
 * Close a file.
 */
export const closeFileHelper = (
  source: MultiFileSource,
  fileId: FileId
): MultiFileSource => {
  const file = source.files[fileId];

  const newSource: MultiFileSource = {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...source.files[fileId], active: false},
    },
    openFiles: source.openFiles?.filter(openFileId => openFileId !== fileId),
  };

  const newActiveFileId = getNewActiveFileId(source, file);
  if (newActiveFileId) {
    newSource.files[newActiveFileId] = {
      ...newSource.files[newActiveFileId],
      active: true,
    };
  }

  return newSource;
};

/**
 * Delete a file.
 */
export const deleteFileHelper = (
  source: MultiFileSource,
  fileId: FileId
): MultiFileSource => {
  const openFileIds = getOpenFileIds(source);
  const newOpenFileIds = openFileIds.find(openFileId => openFileId === fileId)
    ? openFileIds.filter(openFileId => openFileId !== fileId)
    : openFileIds;

  const newSource = {
    ...source,
    files: {
      ...source.files,
    },
    openFiles: newOpenFileIds,
  };
  const fileToBeDeleted = newSource.files[fileId];
  delete newSource.files[fileId];

  const newActiveFileId = getNewActiveFileId(source, fileToBeDeleted);
  if (newActiveFileId) {
    newSource.files[newActiveFileId] = {
      ...newSource.files[newActiveFileId],
      active: true,
    };
  }

  return newSource;
};

/**
 * Create a new folder.
 */
export const createNewFolderHelper = (
  source: MultiFileSource,
  folderName: string,
  parentId: string = DEFAULT_FOLDER_ID
): MultiFileSource => {
  const folderId = getNextFolderId(Object.values(source.folders));
  const newSource = {...source, folders: {...source.folders}};

  newSource.folders[folderId] = {
    id: folderId,
    name: folderName,
    parentId,
  };

  return newSource;
};

/**
 * Delete a folder and all of its contents.
 */
export const deleteFolderHelper = (
  source: MultiFileSource,
  folderId: FolderId
): MultiFileSource => {
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

  // Delete the folder.
  delete newSource.folders[folderId];

  // Delete all its child folders.
  Object.values(newSource.folders)
    .filter(f => subFolders.has(f.id))
    .forEach(f => delete newSource.folders[f.id]);

  // Delete all files housed within this or any child folder.
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

  // Update the active file if necessary.
  const activeFile = Object.values(newSource.files).find(f => f.active);
  if (!activeFile) {
    if (newSource.openFiles && newSource.openFiles.length > 0) {
      // If there are any open files, set the first one as active.
      const firstOpenFileId = newSource.openFiles[0];
      newSource.files[firstOpenFileId] = {
        ...newSource.files[firstOpenFileId],
        active: true,
      };
    }
  }

  return newSource;
};

// If we either close or delete a file, we may need to update the active file.
// This will happen if the file being closed or deleted is the active file.
// Return the new active file ID, or undefined if there is no new active file.
const getNewActiveFileId = (
  source: MultiFileSource,
  fileBeingClosed: ProjectFile
) => {
  if (fileBeingClosed.active) {
    // List of open files before fileBeingClosed was closed.
    const oldOpenFiles = source.openFiles;
    if (!oldOpenFiles || oldOpenFiles.length === 0) {
      return undefined;
    }
    // Find the index of fileBeingClosed.
    const fileIdx = oldOpenFiles.findIndex(f => f === fileBeingClosed.id)!;
    // If there's a file before fileBeingClosed, use that one.

    let newActiveFileId;
    if (fileIdx > 0) {
      newActiveFileId = oldOpenFiles[fileIdx - 1];
    }
    // Otherwise, check to see if there's a file after fileBeingClosed. If so, use that one.
    // We're removing fileBeingClosed from the list of open files, so we have one fewer item in the list,
    // so we need to decrement by 1
    else if (fileIdx < oldOpenFiles.length - 1) {
      newActiveFileId = oldOpenFiles[fileIdx + 1];
    }

    return newActiveFileId;
  }
  return undefined;
};
