import {ProjectFolder} from '../types';

export const getFolderChildren = (
  folderId: string,
  projectFolders: ProjectFolder[]
) => {
  const children = projectFolders.filter(
    folder => folder.parentId === folderId
  );
  if (children.length === 0) {
    return [];
  }
  const allChildIds = children.map(child => child.id);
  children.forEach(child => {
    allChildIds.push(...getFolderChildren(child.id, projectFolders));
  });
  return allChildIds;
};
