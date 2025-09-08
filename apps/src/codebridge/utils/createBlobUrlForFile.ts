import {ProjectFile} from '../types';

// Given a ProjectFile, create a Blob URL for it.
// Currently explicitly supports css, csv, and js files,
// otherwise the file type will be empty.
export const createBlobUrlForFile = async (
  file: ProjectFile
): Promise<string> => {
  // TODO: handle other file types, like images
  let fileType = '';
  console.log(file.language);
  console.log(file?.url);
  console.log(file.language === 'png' && file?.url);
  if (file.language === 'png' && file?.url) {
    console.log('here?');
    const response = await fetch(
      `http://localhost-studio.code.org:9000${file?.url}`
    );
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } else if (file.language === 'css' || file.language === 'csv') {
    fileType = `text/${file.language}`;
  } else if (file.language === 'js') {
    fileType = 'text/javascript';
  }
  const blob = new Blob([file.contents], {type: fileType});
  return URL.createObjectURL(blob);
};
