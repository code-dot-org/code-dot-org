import {ProjectFile, KeyedFolderRecord} from '@codebridge/types';

export const getFullFilePath = (
  file: ProjectFile,
  folders: KeyedFolderRecord
) => {
  const path = [file.name];
  let folderId = file.folderId;

  while (folderId !== '0') {
    path.unshift(folders[folderId].name);
    folderId = folders[folderId].parentId;
  }
  path.unshift('');

  return path.join('/');
};
