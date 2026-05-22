import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectFile} from '@codebridge/types';

import {getFileNameWithNumberSuffix} from './getFileNameWithNumberSuffix';
import {isDuplicateFileName, DuplicateFileError} from './isDuplicateFileName';

export function validateBackpackFileName(
  selectedFile: string,
  projectFiles: Record<string, ProjectFile>,
  validationFile?: ProjectFile
) {
  let isDuplicateName = isDuplicateFileName({
    fileName: selectedFile,
    folderId: DEFAULT_FOLDER_ID,
    projectFiles,
    isStartMode: false,
    validationFile,
  });
  const isSupportFileName =
    isDuplicateName === DuplicateFileError.DUPLICATE_SUPPORT_FILE;
  let newFileName = selectedFile;
  while (isDuplicateName) {
    newFileName = getFileNameWithNumberSuffix(newFileName);
    isDuplicateName = isDuplicateFileName({
      fileName: newFileName,
      folderId: DEFAULT_FOLDER_ID,
      projectFiles,
      isStartMode: false,
      validationFile,
    });
  }
  return {isSupportFileName, newFileName};
}
