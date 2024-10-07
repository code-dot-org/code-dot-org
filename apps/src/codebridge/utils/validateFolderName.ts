import {ProjectType, FolderId} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {isDuplicateFolderName} from './isDuplicateFolderName';
import {isValidFolderName} from './isValidFolderName';

type ValidateFolderNameArgs = {
  folderName: string;
  parentId: FolderId;
  projectFolders: ProjectType['folders'];
};

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
    return codebridgeI18n.folderExistsError();
  }
};
