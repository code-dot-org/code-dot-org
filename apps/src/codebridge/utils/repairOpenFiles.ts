import {MultiFileSource} from '@cdo/apps/lab2/types';

// We used to have an 'open' attribute on files, but now we track open files
// in source.openFiles to have a single source of truth.
// Some projects may not have an openFiles array due to legacy reasons but do
// have an "active" file. In this case, we will set openFiles to be the active file.
export const repairOpenFiles = (source: MultiFileSource): MultiFileSource => {
  const openFiles = source.openFiles ? [...source.openFiles] : [];
  let activeFileNotInOpen = false;
  Object.values(source.files).forEach(file => {
    if (file.active && !openFiles.includes(file.id)) {
      openFiles.push(file.id);
      activeFileNotInOpen = true;
    }
  });
  if (activeFileNotInOpen) {
    return {
      ...source,
      openFiles,
    };
  }
  return source;
};
