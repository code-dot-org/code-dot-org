import {ProjectType, FolderId} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {isDuplicateFolderName} from './isDuplicateFolderName';
import {isValidFolderName} from './isValidFolderName';

type ValidateFolderNameArgs = {
  folderName: string;
  parentId: FolderId;
  projectFolders: ProjectType['folders'];
};

/**
 * Validates a folder name. Internally, this checks to confirm that the folder name does not already exist in the parent folder,
   and that the folder name is valid. Be aware that an empty string is considered a valid name.
 *
 * @param args An object containing the following properties:
 *   - **folderName:** The name of the folder to validate.
 *   - **parentId:** The ID of the parent folder.
 *   - **projectFolders:** An array of project folders.
 *
 * @returns A string error message if the folder name is invalid, or undefined if the folder name is valid.
 */
export const validateFolderName = ({
  folderName,
  parentId,
  projectFolders,
}: ValidateFolderNameArgs) => {
  if (!folderName.length) {
    return;
  }
  if (!isValidFolderName(folderName)) {
    return codebridgeI18n.invalidNameError();
  }

  const duplicate = isDuplicateFolderName({
    folderName,
    parentId,
    projectFolders,
  });

  if (duplicate) {
    return codebridgeI18n.duplicateFolderError({folderName});
  }
};
