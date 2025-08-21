import {DEFAULT_FOLDER_ID} from '@cdo/apps/codebridge/constants';
import {getOpenFileIds} from '@cdo/apps/codebridge/utils';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {
  FileId,
  FolderId,
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';

import {
  getNextFileId,
  getNextFolderId,
  findSubFolders,
  findFiles,
} from './multiFileSourceUtils';

// Helper functions for editing multi-file sources in lab2.

interface CreateNewFileHelperArgs {
  source: MultiFileSource;
  fileName: string;
  folderId?: FolderId;
  contents?: string;
  url?: string;
  isStartMode?: boolean;
  flagged?: boolean;
}

/**
 * Create a new file.
 */
export const createNewFileHelper = ({
  source,
  fileName,
  folderId = DEFAULT_FOLDER_ID,
  contents = '',
  url,
  isStartMode,
  flagged,
}: CreateNewFileHelperArgs): MultiFileSource => {
  const fileId = getNextFileId(Object.values(source.files));
  const newSource = {...source, files: {...source.files}};
  const [, extension] = fileName.split('.');
  const defaultContents = `Add your changes to ${fileName}`;

  const file: ProjectFile = {
    id: fileId,
    name: fileName,
    language: extension || 'html',
    contents: url ? '' : contents || defaultContents,
    folderId,
  };

  if (url) {
    file.url = url;
  }

  if (isStartMode) {
    file.type = ProjectFileType.STARTER;
  }

  if (flagged) {
    file.flagged = flagged;
  }

  newSource.files[fileId] = file;

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

interface DeleteFileHelperArgs {
  source: MultiFileSource;
  fileId: FileId;
}

interface DeleteFileResult {
  newSource: MultiFileSource;
  deletedFileAsset?: {
    channelId: string;
    url: string;
  };
}

/**
 * Deletes a file from the given MultiFileSource.
 * - Removes the file from the files list and from the list of open files.
 * - Updates the active file if the deleted file was active, activating a new file if possible.
 * - Returns the updated MultiFileSource and, if the file was an uploaded asset (has a URL),
 *     details about the deleted file.
 */
export const deleteFileHelper = ({
  source,
  fileId,
}: DeleteFileHelperArgs): DeleteFileResult => {
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

  let deletedFileAsset: {channelId: string; url: string} | undefined;

  // Only attempt delete from S3 if the file is owned by a student (ie, not a level starter asset).
  if (
    fileToBeDeleted.url &&
    !Object.values(ProjectFileType).includes(
      fileToBeDeleted?.type as ProjectFileType
    )
  ) {
    // Extract channelId from asset url.
    const match = fileToBeDeleted.url.match(/\/assets\/([^/]+)/);
    const channelId = match ? match[1] : null;
    if (channelId) {
      deletedFileAsset = {
        channelId,
        url: fileToBeDeleted.url,
      };
    }
  }

  const newActiveFileId = getNewActiveFileId(source, fileToBeDeleted);
  if (newActiveFileId) {
    newSource.files[newActiveFileId] = {
      ...newSource.files[newActiveFileId],
      active: true,
    };
  }

  return {
    newSource,
    deletedFileAsset,
  };
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
      .forEach(f => {
        delete newSource.files[f.id];

        // Only attempt delete from S3 if the file is owned by a student (ie, not a level starter asset).
        if (
          f.url &&
          !Object.values(ProjectFileType).includes(f?.type as ProjectFileType)
        ) {
          try {
            // We don't wait for the deletion to complete because a user's project doesn't depend on the completion of the operation.
            // In the case of a failure, we just end up with an orphaned file in S3.
            HttpClient.delete(f.url);
          } catch (error) {
            Lab2Registry.getInstance()
              .getMetricsReporter()
              .logError(
                'Error deleting project asset (as part of folder deletion) from S3',
                error as Error
              );
          }
        }
      });
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
