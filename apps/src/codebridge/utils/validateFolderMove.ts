import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ProjectFolder} from '@cdo/apps/lab2/types';

import {getFolderChildren} from './getFolderChildren';
import {validateFolderName} from './validateFolderName';

export const validateFolderMove = (
  folderName: string,
  parentId: string,
  projectFolders: Record<string, ProjectFolder>,
  folderId: string
) => {
  let validationError = validateFolderName({
    folderName,
    parentId,
    projectFolders,
  });
  if (!validationError) {
    const childFolders = getFolderChildren(
      folderId,
      Object.values(projectFolders)
    );
    if (childFolders.includes(parentId)) {
      validationError = codebridgeI18n.moveFolderErrorChild();
    }
  }
  return validationError;
};
