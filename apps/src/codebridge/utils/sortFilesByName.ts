import {ProjectType} from '@codebridge/types';

export const sortFilesByName = (
  files: ProjectType['files'],
  options = {mustBeOpen: true}
) => {
  return Object.values(files)
    .filter(f => !options.mustBeOpen || (f.open && options.mustBeOpen))
    .sort((a, b) => a.name.localeCompare(b.name));
};
