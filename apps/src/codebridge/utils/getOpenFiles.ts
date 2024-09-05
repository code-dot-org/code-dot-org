import {ProjectType} from '@codebridge/types';

import {shouldShowFile} from './fileUtils';
import {sortFilesByName} from './sortFilesByName';

export const getOpenFiles = (project: ProjectType) => {
  if (project.openFiles) {
    return project.openFiles.map(fileId => project.files[fileId]);
  } else {
    return sortFilesByName(project.files, {mustBeOpen: true}).filter(f =>
      shouldShowFile(f)
    );
  }
};

export const getOpenFileIds = (project: ProjectType) => {
  const openFiles = getOpenFiles(project);

  return openFiles.map(file => file.id);
};
