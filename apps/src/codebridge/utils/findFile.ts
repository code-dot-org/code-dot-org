import {MultiFileSource} from '@cdo/apps/lab2/types';

export const findFile = (
  sources: MultiFileSource | undefined,
  filename: string,
  folderId: string
) => {
  if (!sources) {
    return undefined;
  }
  const file = Object.values(sources.files).find(
    file => file.name === filename && file.folderId === folderId
  );
  return file;
};
