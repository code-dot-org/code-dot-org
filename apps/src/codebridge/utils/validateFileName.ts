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
    if (duplicateFileError === DuplicateFileError.DUPLICATE_FILE) {
      return codebridgeI18n.duplicateFileError({fileName});
    } else if (
      duplicateFileError === DuplicateFileError.DUPLICATE_SUPPORT_FILE
    ) {
      return codebridgeI18n.duplicateSupportFileError({fileName});
    } else {
      throw new Error(`Unknown Duplicate File Error : ${duplicateFileError}`);
    }
  }
};
