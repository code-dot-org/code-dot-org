import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';

// Returns a list of files matching the given language/extension (eg, 'html').
export const getFilesByLanguage = (
  source: MultiFileSource | undefined,
  language: string
): ProjectFile[] => {
  if (!source) {
    return [];
  }

  return Object.values(source.files).filter(file => {
    const fileLanguage = file.language?.toLowerCase();
    if (fileLanguage === language) {
      return true;
    }
  });
};
