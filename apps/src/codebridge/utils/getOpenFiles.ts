import {MultiFileSource} from '@cdo/apps/lab2/types';

import {shouldShowFile} from './fileUtils';
import {sortFilesByName} from './sortFilesByName';

/**
 * Retrieves an array of open file objects from the source, filtering based on the `shouldShowFile` function.
 *
 * If the source has a defined `openFiles` property, the function returns an array containing open files that
   pass the `shouldShowFile` check. The check is performed on the corresponding file object obtained from the
   source's `files` property using the file ID.
 *
 * If `openFiles` is not defined, the function first sorts all source files by name and then filters the sorted
   files using the `shouldShowFile` function.
 *
 * **Note:** The behavior of the function depends on the implementation of the `shouldShowFile` function (not provided).
 *
 * @param source - The source object.
 * @returns An array of open file objects that pass the `shouldShowFile` check and should be shown.
 */
export const getOpenFiles = (source: MultiFileSource) => {
  if (source.openFiles) {
    return source.openFiles
      .filter(f => shouldShowFile(source.files[f]))
      .map(fileId => source.files[fileId]);
  } else {
    return sortFilesByName(source.files, {mustBeOpen: true}).filter(f =>
      shouldShowFile(f)
    );
  }
};

/**
 * Extracts an array of open file IDs from a source.
 *
 * This function relies on `getOpenFiles` to retrieve the actual open file objects. It then iterates over those files and
 * extracts their `id` properties, returning an array of file IDs.
 *
 * @param source - The source object.
 * @returns An array containing the IDs of the open files in the source.
 */
export const getOpenFileIds = (source: MultiFileSource) => {
  const openFiles = getOpenFiles(source);

  return openFiles.map(file => file.id);
};
