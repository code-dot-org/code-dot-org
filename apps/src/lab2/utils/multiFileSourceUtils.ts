import {ProjectFile, ProjectFolder} from '@cdo/apps/lab2/types';

// Helper functions for operations on multi-file sources in lab2.

// Get the next available file ID based on the existing files in the project.
export const getNextFileId = (files: ProjectFile[]) => {
  return String(Math.max(0, ...files.map(f => Number(f.id))) + 1);
};

// Get the next available folder ID based on the existing folders in the project.
export const getNextFolderId = (folders: ProjectFolder[]) => {
  return String(Math.max(0, ...folders.map(f => Number(f.id))) + 1);
};

// Find all subfolders of a given parent folder, given the parent folder's ID
// and the current folder list.
export const findSubFolders = (parentId: string, folders: ProjectFolder[]) =>
  folders.reduce((bucket, f: ProjectFolder) => {
    if (f.parentId === parentId) {
      bucket.push(f.id, ...findSubFolders(f.id, folders));
    }
    return bucket;
  }, <string[]>[]);

// Find all files in a given folder and its subfolders, returning a list IDs.
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
