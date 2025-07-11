import {ProjectFile, ProjectFolder} from '@cdo/apps/lab2/types';

export const getNextFileId = (files: ProjectFile[]) => {
  return String(Math.max(0, ...files.map(f => Number(f.id))) + 1);
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
