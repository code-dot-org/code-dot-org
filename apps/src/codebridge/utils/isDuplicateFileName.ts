import {ProjectFile} from '@codebridge/types';

import {ProjectFileType} from '@cdo/apps/lab2/types';

type IsDuplicateFileNameArgs = {
  fileName: string;
  folderId: string;
  projectFiles: Record<string, ProjectFile>;
  isStartMode: boolean;
  validationFile?: ProjectFile;
};

export enum DuplicateFileError {
  DUPLICATE_FILE = 'DUPLICATE_FILE',
  DUPLICATE_SUPPORT_FILE = 'DUPLICATE_SUPPORT_FILE',
}

export const isDuplicateFileName = ({
  fileName,
  folderId,
  projectFiles,
  isStartMode,
  validationFile,
}: IsDuplicateFileNameArgs) => {
  // The validation file is in the project files in start mode.
  if (!isStartMode && validationFile?.name === fileName) {
    return DuplicateFileError.DUPLICATE_SUPPORT_FILE;
  } else {
    const existingFile = Object.values(projectFiles).find(
      f => f.name === fileName && f.folderId === folderId
    );
    if (existingFile) {
      if (
        existingFile.type === ProjectFileType.SUPPORT ||
        existingFile.type === ProjectFileType.VALIDATION
      ) {
        return DuplicateFileError.DUPLICATE_SUPPORT_FILE;
      } else {
        return DuplicateFileError.DUPLICATE_FILE;
      }
    }
  }

  return false;
};
