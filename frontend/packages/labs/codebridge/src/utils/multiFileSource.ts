import {ProjectFileTypes} from '@code-dot-org/core/api';
import type {
  FileId,
  FolderId,
  MultiFileSource,
  ProjectFile,
  ProjectFolder,
} from '@code-dot-org/core/api';

import {DEFAULT_FOLDER_ID} from '../constants';

// Pure helpers for operating on and editing a multi-file source. Ported from
// apps/src/lab2/utils/multiFileSource{,Edit}Utils.ts and adapted to the frontend
// core/api schema: `ProjectFile` here carries a required `language` and no `url`,
// so the legacy S3 asset-deletion / `flagged` machinery is dropped. Start-mode /
// system-support hiding (a levelbuilder concern that reads app options) is also
// deferred; the non-start-mode behavior is inlined below.

/** A new, empty multi-file project. */
export const getEmptyProject = (): MultiFileSource => ({
  files: {},
  folders: {},
});

/** Lowercase extension of a filename ("main.py" -> "py"); "" if none. */
export const getFileExtension = (filename: string): string =>
  filename.split('.').pop()?.toLowerCase() || '';

/** Next available file id, one past the current max numeric id. */
export const getNextFileId = (files: ProjectFile[]): FileId =>
  String(Math.max(0, ...files.map(f => Number(f.id))) + 1);

/** Next available folder id, one past the current max numeric id. */
export const getNextFolderId = (folders: ProjectFolder[]): FolderId =>
  String(Math.max(0, ...folders.map(f => Number(f.id))) + 1);

/** Ids of every folder nested (at any depth) under `parentId`. */
export const findSubFolders = (
  parentId: FolderId,
  folders: ProjectFolder[],
): FolderId[] =>
  folders.reduce<FolderId[]>((bucket, f) => {
    if (f.parentId === parentId) {
      bucket.push(f.id, ...findSubFolders(f.id, folders));
    }
    return bucket;
  }, []);

/** Ids of every file in `folderId` and (when `folders` given) its subfolders. */
export const findFiles = (
  folderId: FolderId,
  files: ProjectFile[],
  folders?: ProjectFolder[],
): FileId[] => {
  const folderIds = new Set(
    folders ? [folderId, ...findSubFolders(folderId, folders)] : [folderId],
  );
  return files.reduce<FileId[]>((bucket, f) => {
    if (folderIds.has(f.folderId)) {
      bucket.push(f.id);
    }
    return bucket;
  }, []);
};

/**
 * Whether a file is shown to the user. Non-start-mode only: starter, locked
 * starter, and untyped files are visible; support/validation/system files are
 * not. (Start-mode reveals system/validation files; deferred with levelbuilder.)
 */
export const shouldShowFile = (file?: ProjectFile): boolean => {
  if (!file) {
    return false;
  }
  return (
    !file.type ||
    file.type === ProjectFileTypes.STARTER ||
    file.type === ProjectFileTypes.LOCKED_STARTER
  );
};

/** The open, visible files, in `openFiles` order (else sorted by name). */
export const getOpenFiles = (source: MultiFileSource): ProjectFile[] => {
  if (source.openFiles) {
    return source.openFiles
      .filter(id => shouldShowFile(source.files[id]))
      .map(id => source.files[id]);
  }
  return Object.values(source.files)
    .filter(f => shouldShowFile(f))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/** Ids of the open, visible files. */
export const getOpenFileIds = (source: MultiFileSource): FileId[] =>
  getOpenFiles(source).map(f => f.id);

/**
 * The file the editor should show: the first active file, else the first open
 * file, among the user-visible files.
 */
export const getActiveFileForSource = (
  source: MultiFileSource,
): ProjectFile | undefined => {
  const visible = Object.values(source.files).filter(shouldShowFile);
  return (
    visible.find(f => f.active) ||
    visible.find(f => source.openFiles?.includes(f.id))
  );
};

/**
 * When the active file is closed or deleted, which file becomes active: the
 * previous open file if any, else the next one, else none.
 */
const getNewActiveFileId = (
  source: MultiFileSource,
  fileBeingClosed: ProjectFile,
): FileId | undefined => {
  if (!fileBeingClosed.active) {
    return undefined;
  }
  const openFiles = source.openFiles;
  if (!openFiles || openFiles.length === 0) {
    return undefined;
  }
  const idx = openFiles.findIndex(id => id === fileBeingClosed.id);
  if (idx > 0) {
    return openFiles[idx - 1];
  }
  if (idx < openFiles.length - 1) {
    return openFiles[idx + 1];
  }
  return undefined;
};

/**
 * Return a copy of `source` with `fileId`'s contents replaced. Returns the same
 * reference when nothing changes or the file is absent, so a no-op edit does not
 * trigger a save.
 */
export const saveFileContents = (
  source: MultiFileSource,
  fileId: FileId,
  contents: string,
): MultiFileSource => {
  const existing = source.files[fileId];
  if (!existing || existing.contents === contents) {
    return source;
  }
  return {
    ...source,
    files: {...source.files, [fileId]: {...existing, contents}},
  };
};

/** Make `fileId` the active file, opening it if it was closed. */
export const activateFile = (
  source: MultiFileSource,
  fileId: FileId,
): MultiFileSource => {
  const activeFile = getActiveFileForSource(source);
  if (activeFile?.id === fileId && activeFile.active) {
    return source;
  }

  const openFileIds = getOpenFileIds(source);
  if (!openFileIds.includes(fileId)) {
    openFileIds.push(fileId);
  }

  const newSource: MultiFileSource = {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...source.files[fileId], active: true},
    },
    openFiles: openFileIds,
  };

  if (activeFile) {
    newSource.files[activeFile.id] = {
      ...newSource.files[activeFile.id],
      active: false,
    };
  }

  return newSource;
};

/** Close `fileId`, activating a neighbor if it was the active file. */
export const closeFile = (
  source: MultiFileSource,
  fileId: FileId,
): MultiFileSource => {
  const file = source.files[fileId];
  const newSource: MultiFileSource = {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...source.files[fileId], active: false},
    },
    openFiles: source.openFiles?.filter(id => id !== fileId),
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

interface CreateFileArgs {
  source: MultiFileSource;
  fileName: string;
  /** Language tag for the file (e.g. "python"). The consuming lab's config
   * ultimately supplies this; callers may pass the extension as a placeholder. */
  language: string;
  folderId?: FolderId;
  contents?: string;
}

/** Create a new file and make it active. */
export const createNewFile = ({
  source,
  fileName,
  language,
  folderId = DEFAULT_FOLDER_ID,
  contents = '',
}: CreateFileArgs): MultiFileSource => {
  const fileId = getNextFileId(Object.values(source.files));
  const newSource: MultiFileSource = {...source, files: {...source.files}};

  newSource.files[fileId] = {
    id: fileId,
    name: fileName,
    language,
    contents: contents || `Add your changes to ${fileName}`,
    folderId,
  };

  return activateFile(newSource, fileId);
};

export interface CreateExternalFileArgs {
  source: MultiFileSource;
  fileName: string;
  language: string;
  /** Where the uploaded bytes live (the assets backend URL). */
  url: string;
  mimeType?: string;
  folderId?: FolderId;
}

/**
 * Add an uploaded (binary) file — an image, audio, etc. Unlike a text file it
 * has no editable `contents`; the bytes live in the assets backend and are
 * referenced by `url` (see `ProjectFile`). Same id/activation flow as
 * {@link createNewFile}.
 */
export const createExternalFile = ({
  source,
  fileName,
  language,
  url,
  mimeType,
  folderId = DEFAULT_FOLDER_ID,
}: CreateExternalFileArgs): MultiFileSource => {
  const fileId = getNextFileId(Object.values(source.files));
  const newSource: MultiFileSource = {...source, files: {...source.files}};

  newSource.files[fileId] = {
    id: fileId,
    name: fileName,
    language,
    contents: '',
    folderId,
    url,
    mimeType,
  };

  return activateFile(newSource, fileId);
};

/** Delete a file, activating a neighbor if it was active. */
export const deleteFile = (
  source: MultiFileSource,
  fileId: FileId,
): MultiFileSource => {
  const fileToDelete = source.files[fileId];
  const newSource: MultiFileSource = {
    ...source,
    files: {...source.files},
    openFiles: source.openFiles?.filter(id => id !== fileId),
  };
  delete newSource.files[fileId];

  const newActiveFileId = getNewActiveFileId(source, fileToDelete);
  if (newActiveFileId) {
    newSource.files[newActiveFileId] = {
      ...newSource.files[newActiveFileId],
      active: true,
    };
  }

  return newSource;
};

/** Rename a file. */
export const renameFile = (
  source: MultiFileSource,
  fileId: FileId,
  name: string,
): MultiFileSource => ({
  ...source,
  files: {...source.files, [fileId]: {...source.files[fileId], name}},
});

/** Move a file into `folderId`. */
export const moveFile = (
  source: MultiFileSource,
  fileId: FileId,
  folderId: FolderId,
): MultiFileSource => ({
  ...source,
  files: {...source.files, [fileId]: {...source.files[fileId], folderId}},
});

/** Create a new folder. */
export const createNewFolder = (
  source: MultiFileSource,
  folderName: string,
  parentId: FolderId = DEFAULT_FOLDER_ID,
): MultiFileSource => {
  const folderId = getNextFolderId(Object.values(source.folders));
  return {
    ...source,
    folders: {
      ...source.folders,
      [folderId]: {id: folderId, name: folderName, parentId},
    },
  };
};

/** Delete a folder and everything (folders and files) nested within it. */
export const deleteFolder = (
  source: MultiFileSource,
  folderId: FolderId,
): MultiFileSource => {
  const doomedFolders = new Set([
    folderId,
    ...findSubFolders(folderId, Object.values(source.folders)),
  ]);
  const doomedFiles = new Set(
    findFiles(
      folderId,
      Object.values(source.files),
      Object.values(source.folders),
    ),
  );

  const folders = Object.fromEntries(
    Object.entries(source.folders).filter(([id]) => !doomedFolders.has(id)),
  );
  const files = Object.fromEntries(
    Object.entries(source.files).filter(([id]) => !doomedFiles.has(id)),
  );
  const openFiles = source.openFiles?.filter(id => !doomedFiles.has(id));

  const newSource: MultiFileSource = {...source, folders, files, openFiles};

  // If we deleted the active file, activate the first remaining open file.
  if (!Object.values(files).some(f => f.active) && openFiles?.length) {
    const firstOpenId = openFiles[0];
    newSource.files = {
      ...files,
      [firstOpenId]: {...files[firstOpenId], active: true},
    };
  }

  return newSource;
};

/** Toggle a folder's expanded/collapsed state. */
export const toggleFolderOpen = (
  source: MultiFileSource,
  folderId: FolderId,
): MultiFileSource => ({
  ...source,
  folders: {
    ...source.folders,
    [folderId]: {
      ...source.folders[folderId],
      open: !source.folders[folderId].open,
    },
  },
});

/** Rename a folder. */
export const renameFolder = (
  source: MultiFileSource,
  folderId: FolderId,
  name: string,
): MultiFileSource => ({
  ...source,
  folders: {...source.folders, [folderId]: {...source.folders[folderId], name}},
});

/** Move a folder under `parentId`. */
export const moveFolder = (
  source: MultiFileSource,
  folderId: FolderId,
  parentId: FolderId,
): MultiFileSource => ({
  ...source,
  folders: {
    ...source.folders,
    [folderId]: {...source.folders[folderId], parentId},
  },
});
