import {ProjectType, FolderId, ProjectFile} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {isDuplicateFileName, DuplicateFileError} from './isDuplicateFileName';
import {isValidFileName} from './isValidFileName';

type ValidateFileNameArgs = {
  fileName: string;
  folderId: FolderId;
  projectFiles: ProjectType['files'];
  isStartMode: boolean;
  validationFile: ProjectFile | undefined;
};

/**
 * Validates a file name. Internally, this checks to confirm that the file has an extension, the file name does not already exist
   in the parent folder, and that the file name is valid. Be aware that an empty string is considered a valid name.
 *
 * @param args An object containing the following properties:
 *   - **fileName:** The name of the file to validate.
 *   - **folderId:** The ID of the parent folder.
 *   - **projectFiles:** An array of project files.
 *   - **isStartMode:** Indicates if the application is in start mode.
 *   - **validationFile:** The validation file.
 *
 * @returns A string error message if the file name is invalid, or undefined if the file name is valid.
 */
export const validateFileName = ({
  fileName,
  folderId,
  projectFiles,
  isStartMode,
  validationFile,
}: ValidateFileNameArgs) => {
  if (!fileName.length) {
    return;
  }

  const [, extension] = fileName.split('.');
  if (!extension) {
    return codebridgeI18n.noFileExtensionError();
  }

  if (!isValidFileName(fileName)) {
    return codebridgeI18n.invalidNameError();
  }

  const duplicateFileError = isDuplicateFileName({
    fileName,
    folderId,
    projectFiles,
    isStartMode,
    validationFile,
  });

  if (duplicateFileError) {
    if (duplicateFileError === DuplicateFileError.DUPLICATE_SUPPORT_FILE) {
      return codebridgeI18n.duplicateSupportFileError({fileName});
    } else {
      return codebridgeI18n.duplicateFileError({fileName});
    }
  }
};
