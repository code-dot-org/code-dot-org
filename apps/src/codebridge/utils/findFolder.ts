import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectFolder} from '@codebridge/types';

/**
 * Recursively searches for a folder within a project based on a folder lineage.
 *
 * @param folderLineage - An optional array of strings representing the path segments of the folder. Empty strings within the array are ignored.
 * @param options - An object containing configuration for the search.
 *  * `options.folders` - A required array of `ProjectFolder` objects representing all folders in the project.
 *  * `options.required` (default: `false`): Whether the specified folder is required to exist. If `true` and a folder is not found, an error is thrown. If `false`, `DEFAULT_FOLDER_ID` is returned for missing folders.
 * @returns The ID of the found folder, or `DEFAULT_FOLDER_ID` if the folder is not found and `options.required` is `false`. Throws an error if the folder is not found and `options.required` is `true`.
 */
export const findFolder = (
  folderLineage: string[] = [],
  options: {folders: ProjectFolder[]; required?: boolean}
) => {
  return folderLineage.reduce((parentId: string, name: string) => {
    if (!name.length) {
      return parentId;
    }

    const folder = Object.values(options.folders).find(
      f => f.name === name && f.parentId === parentId
    );

    if (!folder) {
      if (options.required) {
        throw new Error(`Could not find folder ${folderLineage.join('/')}`);
      } else {
        return DEFAULT_FOLDER_ID;
      }
    }

    return folder.id;
  }, DEFAULT_FOLDER_ID);
};
