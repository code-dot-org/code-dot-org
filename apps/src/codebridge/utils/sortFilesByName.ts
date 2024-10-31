import {ProjectType} from '@codebridge/types';

/**
 * Sorts an array of files by their names.
 *
 * @param files - A record of {[id : FileId] : ProjectFile}
 * @param options - An optional configuration object.
 *  * `options.mustBeOpen` (default: `true`): Whether to include only open files in the sorting.
 * @returns A new array containing the sorted files.
 */
export const sortFilesByName = (
  files: ProjectType['files'],
  options = {mustBeOpen: true}
) => {
  return Object.values(files)
    .filter(f => !options.mustBeOpen || (f.open && options.mustBeOpen))
    .sort((a, b) => a.name.localeCompare(b.name));
};
