import {ProjectFileTypes} from '@code-dot-org/core/api';
import type {
  FileId,
  MultiFileSource,
  ProjectFile,
} from '@code-dot-org/core/api';

/** A new, empty multi-file project. */
export const getEmptyProject = (): MultiFileSource => ({
  files: {},
  folders: {},
});

/**
 * The file the editor should show: the first active file, else the first open
 * file, among the user-visible (starter-ish) files.
 *
 * Simplified from apps/src/lab2/projects/utils#getActiveFileForSource: the
 * start-mode / system-support hiding there is a levelbuilder concern that reads
 * app options, deferred until the levelbuilder path is ported.
 */
export const getActiveFileForSource = (
  source: MultiFileSource,
): ProjectFile | undefined => {
  const visible = Object.values(source.files).filter(
    f =>
      !f.type ||
      f.type === ProjectFileTypes.STARTER ||
      f.type === ProjectFileTypes.LOCKED_STARTER,
  );

  return (
    visible.find(f => f.active) ||
    visible.find(f => source.openFiles?.includes(f.id))
  );
};

/**
 * Return a copy of `source` with `fileId`'s contents replaced. Returns the same
 * reference when nothing changes or the file is absent, so a no-op edit does not
 * trigger a save.
 *
 * Mirrors the `saveFile` reducer in apps/src/lab2/redux/lab2ProjectRedux.ts.
 */
export const saveFileContents = (
  source: MultiFileSource,
  fileId: FileId,
  contents: string,
): MultiFileSource => {
  const existing = source.files[fileId];
  if (!existing || existing.contents === contents) {
    return source;
  }

  return {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...existing, contents},
    },
  };
};
