import {ProjectType} from '@codebridge/types';

import {shouldShowFile} from './fileUtils';
import {sortFilesByName} from './sortFilesByName';

/**
 * Retrieves an array of open file objects from a project, filtering based on the `shouldShowFile` function.
 *
 * If the project has a defined `openFiles` property, the function returns an array containing open files that
   pass the `shouldShowFile` check. The check is performed on the corresponding file object obtained from the
   project's `files` property using the file ID.
 *
 * If `openFiles` is not defined, the function first sorts all project files by name and then filters the sorted
   files using the `shouldShowFile` function.
 *
 * **Note:** The behavior of the function depends on the implementation of the `shouldShowFile` function (not provided).
 *
 * @param project - The project object.
 * @returns An array of open file objects that pass the `shouldShowFile` check and should be shown.
 */
export const getOpenFiles = (project: ProjectType) => {
  if (project.openFiles) {
    return project.openFiles
      .filter(f => shouldShowFile(project.files[f]))
      .map(fileId => project.files[fileId]);
  } else {
    return sortFilesByName(project.files, {mustBeOpen: true}).filter(f =>
      shouldShowFile(f)
    );
  }
};

/**
 * Extracts an array of open file IDs from a project.
 *
 * This function relies on `getOpenFiles` to retrieve the actual open file objects. It then iterates over those files and extracts their `id` properties, returning an array of file IDs.
 *
 * @param project - The project object.
 * @returns An array containing the IDs of the open files in the project.
 */
export const getOpenFileIds = (project: ProjectType) => {
  const openFiles = getOpenFiles(project);

  return openFiles.map(file => file.id);
};
