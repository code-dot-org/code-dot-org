import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {FolderId, ProjectType} from '@codebridge/types';

import {getFolderLineage} from './getFolderLineage';

/**
 * Gets the full path of a folder within a project, given its ID and a list of all project folders.
 *
 * This function traverses the folder hierarchy by recursively searching for parent folders using their IDs.
 * If the specified folder is not found or has no parent folders, an empty string is returned.
 *
 * @param folderId - The unique identifier of the target folder.
 * @param projectFolders - An array containing all folders within the project, including the target folder.
 * @returns - The full path of the target folder, or an empty string if not found.
 */
export const getFolderPath = (
  folderId: FolderId,
  projectFolders: ProjectType['folders']
) => {
  if (folderId === DEFAULT_FOLDER_ID) {
    return '/';
  }

  const fullPath = getFolderLineage(folderId, Object.values(projectFolders));

  return fullPath
    .map(id => (id === DEFAULT_FOLDER_ID ? '' : projectFolders[id].name))
    .join('/');
};
