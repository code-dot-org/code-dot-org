import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

// Returns a list of files matching the given extension (eg, 'html').
export const getFilesByLanguage = (
  source: MultiFileSource | undefined,
  language: string
): ProjectFile[] => {
  if (!source) {
    return [];
  }

  return Object.values(source.files).filter(
    file => getFileExtension(file.name) === language
  );
};
