import {ProjectFile} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ProjectFileType} from '@cdo/apps/lab2/types';

export const checkForDuplicateFilename = (
  fileName: string,
  folderId: string,
  projectFiles: Record<string, ProjectFile>,
  isStartMode: boolean,
  validationFile?: ProjectFile
) => {
  let message = undefined;
  // The validation file is in the project files in start mode.
  if (!isStartMode && validationFile?.name === fileName) {
    message = codebridgeI18n.duplicateSupportFileError({fileName});
  } else {
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
  }

  return message;
};
