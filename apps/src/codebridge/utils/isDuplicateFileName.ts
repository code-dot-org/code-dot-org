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

/**
 * Checks if a file name already exists within a given folder.
 *
 * @param args An object containing the following properties:
 *   - **fileName:** The name of the file to check.
 *   - **folderId:** The ID of the parent folder for the file.
 *   - **projectFiles:** An array of project files.
 *   - **isStartMode:** Indicates if the application is in start mode.
 *   - **validationFile:** The validation file (optional).
 *
 * @returns A truthy value indicating a duplicate file situation or `false` if not a duplicate:
 *   - **DuplicateFileError.DUPLICATE_SUPPORT_FILE:** If the file name matches the validation file name in non-start mode, or if an existing file with the same name and folder ID is a support or validation file.
 *   - **DuplicateFileError.DUPLICATE_FILE:** If an existing file with the same name and folder ID is not a support or validation file.
 *   - **false:** If the file name is not a duplicate.
 */
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
