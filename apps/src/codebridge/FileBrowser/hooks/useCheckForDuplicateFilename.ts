import {ProjectFile} from '@codebridge/types';
import {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ProjectFileType} from '@cdo/apps/lab2/types';

// Check if the filename is already in use in the given folder.
// If it is, alert the user and return true, otherwise return false.
export const useCheckForDuplicateFilename = () => {
  return useCallback(
    (
      fileName: string,
      folderId: string,
      projectFiles: Record<string, ProjectFile>
    ) => {
      let message = undefined;
      const existingFile = Object.values(projectFiles).find(
        f => f.name === fileName && f.folderId === folderId
      );
      if (existingFile) {
        message = codebridgeI18n.duplicateFileError({fileName});
        if (
          existingFile.type === ProjectFileType.SUPPORT ||
          existingFile.type === ProjectFileType.VALIDATION
        ) {
          message = codebridgeI18n.duplicateSupportFileError({fileName});
        }
      }

      return message;
    },
    []
  );
};
