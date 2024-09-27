import {ProjectFolder} from '@codebridge/types';
import {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

export const useCheckForDuplicateFoldername = () => {
  return useCallback(
    (
      folderName: string,
      folderId: string,
      projectFolders: Record<string, ProjectFolder>
    ) => {
      let message = undefined;
      const existingFolder = Object.values(projectFolders).find(
        f => f.name === folderName && f.parentId === folderId
      );
      if (existingFolder) {
        message = codebridgeI18n.duplicateFolderError({folderName});
      }

      return message;
    },
    []
  );
};
