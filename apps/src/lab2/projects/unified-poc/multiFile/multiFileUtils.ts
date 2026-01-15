/**
 * Example of a few utility function to handle more complex multi-file scenarios (adapted from lab2ProjectRedux)
 *
 * Sample Usage:
 *
 * const {currentSource, updateSources} = useSource<MultiFileProjectSources>({levelProperties: ..., ...});
 *
 * const onRenameClick = (fileId: string, newName: string) => {
 *   renameFile(fileId, newName, currentSource, updateSources);
 * }
 *
 * const onMoveFolderClick = (folderId: FolderId, parentId: FolderId) => {
 *   moveFolder(folderId, parentId, currentSource, updateSources);
 * }
 */

import {FolderId, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';

interface MultiFileProjectSources extends ProjectSources {
  source: MultiFileSource;
}

export function renameFile(
  fileId: string,
  newName: string,
  currentSources: MultiFileProjectSources,
  updateSources: (
    newSources: MultiFileProjectSources,
    forceSave?: boolean
  ) => void
) {
  const source = currentSources.source;
  if (!source.files[fileId] || source.files[fileId]?.name === newName) {
    // No-op if the name is the same or the file does not exist.
    return;
  }
  updateSources({
    ...currentSources,
    source: {
      ...source,
      files: {
        ...source.files,
        [fileId]: {
          ...source.files[fileId],
          name: newName,
          language: newName.split('.').pop()?.toLowerCase() || '',
        },
      },
    },
  });
}

export function moveFolder(
  folderId: FolderId,
  parentId: FolderId,
  currentSources: MultiFileProjectSources,
  updateSources: (
    newSources: MultiFileProjectSources,
    forceSave?: boolean
  ) => void
) {
  const source = currentSources.source;
  if (
    !source.folders[folderId] ||
    source.folders[folderId].parentId === parentId
  ) {
    // No-op if the folder does not exist or is already in the target parent.
    return;
  }
  updateSources({
    ...currentSources,
    source: {
      ...source,
      folders: {
        ...source.folders,
        [folderId]: {
          ...source.folders[folderId],
          parentId: parentId,
        },
      },
    },
  });
}
