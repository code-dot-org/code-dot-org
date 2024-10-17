import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {FolderId, ProjectFolder} from '@codebridge/types';

/**
 * Gets the full path of a folder within a project, given its ID and a list of all project folders.
 *
 * This function traverses the folder hierarchy by recursively searching for parent folders using their IDs.
 * If the specified folder is not found or has no parent folders, an empty string is returned.
 *
 * @param folderId - The unique identifier of the target folder.
 * @param projectFolders - An array containing all folders within the project, including the target folder.
 * @returns - An array of all parent folder ids + the original folder id, in order from most distant to the folder id
 */
export const getFolderLineage = (
  folderId: FolderId,
  projectFolders: ProjectFolder[]
) => {
  // if we're given the DEFAULT_FOLDER_ID, then wrap and return it
  if (folderId === DEFAULT_FOLDER_ID) {
    return [DEFAULT_FOLDER_ID];
  }

  let folder = projectFolders.find(f => f.id === folderId);

  if (!folder) {
    return [];
  }
  const parents = [];

  while (folder) {
    parents.unshift(folder.id);
    folder = projectFolders.find(f => f.id === folder?.parentId);
  }

  parents.unshift(DEFAULT_FOLDER_ID); // and the first element should always be the project root

  return parents;
};
