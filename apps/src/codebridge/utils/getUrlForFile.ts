import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

import {ProjectFile} from '../types';

// Given a ProjectFile, either create a Blob URL for it or get its external URL.
export const getUrlForFile = (
  file: ProjectFile,
  parentOrigin: string,
  externalFileTypes: string[]
): string => {
  const ext = getFileExtension(file.name);
  let fileType = '';
  if (externalFileTypes.includes(ext)) {
    return `${parentOrigin}${file?.url}` || '';
  } else if (ext === 'css' || ext === 'csv') {
    fileType = `text/${ext}`;
  } else if (ext === 'js') {
    fileType = 'text/javascript';
  }
  const blob = new Blob([file.contents], {type: fileType});
  return URL.createObjectURL(blob);
};
