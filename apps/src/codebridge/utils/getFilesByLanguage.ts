import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';

// Returns a list of files matching the given language (by file.language or extension).
export const getFilesByLanguage = (
  source: MultiFileSource | undefined,
  language: string
): ProjectFile[] => {
  if (!source) {
    return [];
  }
  const normalizedLanguage = language.toLowerCase();
  return Object.values(source.files).filter(file => {
    const fileLanguage = file.language?.toLowerCase();
    if (fileLanguage === normalizedLanguage) {
      return true;
    }
  });
};
