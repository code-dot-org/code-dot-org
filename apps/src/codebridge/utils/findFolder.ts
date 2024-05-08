import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectFolder} from '@codebridge/types';

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
