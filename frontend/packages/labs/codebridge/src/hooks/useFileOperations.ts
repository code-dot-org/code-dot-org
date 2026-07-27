import {useMemo} from 'react';

import type {FileId, FolderId, MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import * as edit from '../utils/multiFileSource';

export interface FileOperations {
  /** The current multi-file source. */
  source: MultiFileSource;
  activateFile: (fileId: FileId) => void;
  closeFile: (fileId: FileId) => void;
  saveFile: (fileId: FileId, contents: string) => void;
  newFile: (args: {
    fileName: string;
    language: string;
    folderId?: FolderId;
    contents?: string;
  }) => void;
  /** Add an uploaded binary file (no contents; referenced by URL). */
  newExternalFile: (args: {
    fileName: string;
    language: string;
    url: string;
    mimeType?: string;
    folderId?: FolderId;
  }) => void;
  renameFile: (fileId: FileId, name: string) => void;
  deleteFile: (fileId: FileId) => void;
  moveFile: (fileId: FileId, folderId: FolderId) => void;
  newFolder: (folderName: string, parentId?: FolderId) => void;
  renameFolder: (folderId: FolderId, name: string) => void;
  deleteFolder: (folderId: FolderId) => void;
  moveFolder: (folderId: FolderId, parentId: FolderId) => void;
  toggleFolder: (folderId: FolderId) => void;
}

/**
 * File and folder operations bound to the base `SourcesContext`. Each operation
 * applies a pure edit helper to the current `MultiFileSource` and writes the
 * result back through `updateSources`, which persists via
 * `LabRegistry.projectManager`. A no-op edit (helper returns the same reference)
 * is skipped, so it does not trigger a save.
 *
 * This is the frontend replacement for the legacy `lab2ProjectReduxThunks` that
 * Codebridge components dispatched. The `codebridgeWorkspace` redux slice stays
 * UI-chrome only; the source of truth is the SourcesContext, not redux.
 */
export const useFileOperations = (): FileOperations => {
  const {currentSources, updateSources} = useSources<MultiFileSource>();
  const source = currentSources.source;

  return useMemo(() => {
    const commit = (next: MultiFileSource) => {
      if (next !== source) {
        updateSources({...currentSources, source: next});
      }
    };

    return {
      source,
      activateFile: id => commit(edit.activateFile(source, id)),
      closeFile: id => commit(edit.closeFile(source, id)),
      saveFile: (id, contents) =>
        commit(edit.saveFileContents(source, id, contents)),
      newFile: args => commit(edit.createNewFile({source, ...args})),
      newExternalFile: args =>
        commit(edit.createExternalFile({source, ...args})),
      renameFile: (id, name) => commit(edit.renameFile(source, id, name)),
      deleteFile: id => commit(edit.deleteFile(source, id)),
      moveFile: (id, folderId) => commit(edit.moveFile(source, id, folderId)),
      newFolder: (name, parentId) =>
        commit(edit.createNewFolder(source, name, parentId)),
      renameFolder: (id, name) => commit(edit.renameFolder(source, id, name)),
      deleteFolder: id => commit(edit.deleteFolder(source, id)),
      moveFolder: (id, parentId) =>
        commit(edit.moveFolder(source, id, parentId)),
      toggleFolder: id => commit(edit.toggleFolderOpen(source, id)),
    };
  }, [source, currentSources, updateSources]);
};
