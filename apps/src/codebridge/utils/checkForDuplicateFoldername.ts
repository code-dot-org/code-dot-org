import {ProjectFolder} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

type CheckForDuplicateFoldernameArgs = {
  folderName: string;
  folderId: string;
  projectFolders: Record<string, ProjectFolder>;
};

// Check if the foldername is already in use in the given folder.
// If it is, alert the user and return true, otherwise return false.
export const checkForDuplicateFoldername = ({
  folderName,
  folderId,
  projectFolders,
}: CheckForDuplicateFoldernameArgs) => {
  let message = undefined;
  const existingFolder = Object.values(projectFolders).find(
    f => f.name === folderName && f.parentId === folderId
  );
  if (existingFolder) {
    message = codebridgeI18n.duplicateFolderError({folderName});
  }

  return message;
};
