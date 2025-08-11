import {ProjectFile} from '../types';

export const createBlobUrlForFile = (file: ProjectFile): string => {
  // TODO: handle other file types, like images
  let fileType = '';
  if (file.language === 'css' || file.language === 'csv') {
    fileType = `text/${file.language}`;
  } else if (file.language === 'js') {
    fileType = 'text/javascript';
  }
  const blob = new Blob([file.contents], {type: fileType});
  return URL.createObjectURL(blob);
};
