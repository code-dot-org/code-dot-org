import {MultiFileSource} from '@cdo/apps/lab2/types';

// We used to have an 'open' attribute on files, but now we track open files
// in source.openFiles. This is the single source of truth which allows for tab ordering.
// Some projects may not have an openFiles array due to legacy reasons but do
// have "active" and/or "open" files. In this case, we will set openFiles to be the
// active and/or open files.
export const repairOpenFiles = (source: MultiFileSource): MultiFileSource => {
  const openFiles = source.openFiles ? [...source.openFiles] : [];
  let updatedOpenList = false;
  Object.values(source.files).forEach(file => {
    const isOpen = (file as unknown as {open: boolean}).open; // Legacy open attribute
    if ((isOpen || file.active) && !openFiles.includes(file.id)) {
      openFiles.push(file.id);
      updatedOpenList = true;
    }
  });
  if (updatedOpenList) {
    return {
      ...source,
      openFiles,
    };
  }
  return source;
};
