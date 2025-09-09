import {ProjectFile} from '../types';

// Given a ProjectFile, either create a Blob URL for it or get its external URL.
export const getUrlForFile = (
  file: ProjectFile,
  externalFileTypes: string[]
): string => {
  let fileType = '';
  if (externalFileTypes.includes(file.language)) {
    return file?.url || '';
  } else if (file.language === 'css' || file.language === 'csv') {
    fileType = `text/${file.language}`;
  } else if (file.language === 'js') {
    fileType = 'text/javascript';
  }
  const blob = new Blob([file.contents], {type: fileType});
  return URL.createObjectURL(blob);
};
