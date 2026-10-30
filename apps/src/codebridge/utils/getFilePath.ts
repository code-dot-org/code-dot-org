import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectFile} from '@codebridge/types';
import {getFolderPath} from '@codebridge/utils';

import {MultiFileSource} from '@cdo/apps/lab2/types';

export const getFilePath = (
  file: ProjectFile,
  folders: MultiFileSource['folders']
): string => {
  if (file.folderId === DEFAULT_FOLDER_ID) {
    return file.name;
  }
  const folderPath = getFolderPath(file.folderId, folders);
  return `${folderPath}/${file.name}`;
};
