import {MultiFileSource, ProjectFile, FileId} from '@cdo/apps/lab2/types';

// Given a MultiFileSource, return a new MultiFileSource that removes the openFiles
// and active file/folder information, as this is not needed for preview. This allows us to avoid
// re-rendering the preview iframe when only open/active files change.
export const filterSourceForPreview = (
  source: MultiFileSource | undefined
): MultiFileSource | undefined => {
  if (!source) {
    return source;
  }
  const files: Record<FileId, ProjectFile> = Object.fromEntries(
    Object.entries(source.files).map(([fileId, file]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {active, ...props} = file;
      return [fileId, props];
    })
  );

  const folders = Object.fromEntries(
    Object.entries(source.folders).map(([folderId, folder]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {open, ...props} = folder;
      return [folderId, props];
    })
  );

  return {
    files,
    folders,
    // Skip including openFiles
  };
};
