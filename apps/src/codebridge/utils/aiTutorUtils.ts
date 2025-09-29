import {ProjectFile} from '@codebridge/types';

export const enableUserAddedSelectionContext = (
  appName: string,
  file: ProjectFile
) => {
  // If the file has a url, that means it is not a text file, and therefore we cannot
  // currently add it as user added context.
  return appName === 'weblab2' && !file.url;
};
