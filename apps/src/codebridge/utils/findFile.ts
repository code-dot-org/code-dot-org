import {MultiFileSource} from '@cdo/apps/lab2/types';

// Returns the given filename in the given folder id, if it exists,
// or undefined if it does not.
export const findFile = (
  sources: MultiFileSource | undefined,
  filename: string,
  folderId: string
) => {
  if (!sources) {
    return undefined;
  }
  return Object.values(sources.files).find(
    file => file.name === filename && file.folderId === folderId
  );
};
