import {FileId, FolderId} from '@codebridge/types';
import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {
  LabConfig,
  MultiFileSource,
  ProjectSources,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
import {
  activateFileHelper,
  closeFileHelper,
  createNewFileHelper,
  createNewFolderHelper,
  deleteFileHelper,
  deleteFolderHelper,
} from '@cdo/apps/lab2/utils/multiFileSourceEditUtils';

export interface Lab2ProjectState {
  projectSources: ProjectSources | undefined;
  viewingOldVersion: boolean;
  restoredOldVersion: boolean;
  hasEdited: boolean;
  projectTooLarge: boolean;
  lastSavedLabConfig: LabConfig | undefined;
}

const initialState: Lab2ProjectState = {
  projectSources: undefined,
  viewingOldVersion: false,
  restoredOldVersion: false,
  hasEdited: false,
  projectTooLarge: false,
  lastSavedLabConfig: undefined,
};

// SLICE

const projectSlice = createSlice({
  name: 'lab2Project',
  initialState,
  reducers: {
    setProjectSource(state, action: PayloadAction<ProjectSources | undefined>) {
      state.projectSources = action.payload;
    },
    setSource(state, action: PayloadAction<MultiFileSource>) {
      state.projectSources = {
        ...state.projectSources,
        source: action.payload,
      };
    },
    setPreviousVersionSource(
      state,
      action: PayloadAction<ProjectSources | undefined>
    ) {
      state.projectSources = action.payload;
      state.viewingOldVersion = true;
    },
    setViewingOldVersion(state, action: PayloadAction<boolean>) {
      state.viewingOldVersion = action.payload;
    },
    setRestoredOldVersion(state, action: PayloadAction<boolean>) {
      state.restoredOldVersion = action.payload;
    },
    setHasEdited(state, action: PayloadAction<boolean>) {
      state.hasEdited = action.payload;
    },
    setProjectTooLarge(state, action: PayloadAction<boolean>) {
      state.projectTooLarge = action.payload;
    },
    createNewFile(
      state,
      action: PayloadAction<{
        fileName: string;
        folderId?: FolderId;
        contents?: string;
      }>
    ) {
      if (state.projectSources?.source) {
        state.projectSources = {
          ...state.projectSources,
          source: createNewFileHelper({
            source: state.projectSources?.source as MultiFileSource,
            fileName: action.payload.fileName,
            folderId: action.payload.folderId,
            contents: action.payload.contents,
          }),
        };
        state.hasEdited = true;
      }
    },
    createNewExternalFile(
      state,
      action: PayloadAction<{
        fileName: string;
        url: string;
        folderId?: FolderId;
        flagged?: boolean;
      }>
    ) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        const newFileId = createNewFileHelper({
          source,
          fileName: action.payload.fileName,
          folderId: action.payload.folderId,
          url: action.payload.url,
          flagged: action.payload.flagged,
        });
        state.projectSources = {
          ...state.projectSources,
          source: newFileId,
        };
        state.hasEdited = true;
      }
    },
    renameFile(
      state,
      action: PayloadAction<{fileId: FileId; newName: string}>
    ) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (
          !source.files[action.payload.fileId] ||
          source.files[action.payload.fileId]?.name === action.payload.newName
        ) {
          // No-op if the name is the same or the file does not exist.
          return;
        }
        state.projectSources = {
          ...state.projectSources,
          source: {
            ...source,
            files: {
              ...source.files,
              [action.payload.fileId]: {
                ...source.files[action.payload.fileId],
                name: action.payload.newName,
              },
            },
          },
        };
        state.hasEdited = true;
      }
    },
    saveFile(state, action: PayloadAction<{fileId: FileId; contents: string}>) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (
          !source.files[action.payload.fileId] ||
          source.files[action.payload.fileId]?.contents ===
            action.payload.contents
        ) {
          // No-op if the contents are the same or the file does not exist.
          return;
        }
        state.projectSources = {
          ...state.projectSources,
          source: {
            ...source,
            files: {
              ...source.files,
              [action.payload.fileId]: {
                ...source.files[action.payload.fileId],
                contents: action.payload.contents,
              },
            },
          },
        };
        state.hasEdited = true;
      }
    },
    setFileType(
      state,
      action: PayloadAction<{fileId: FileId; type: ProjectFileType}>
    ) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (
          !source.files[action.payload.fileId] ||
          source.files[action.payload.fileId]?.type === action.payload.type
        ) {
          // No-op if the type is the same or the file does not exist.
          return;
        }
        state.projectSources = {
          ...state.projectSources,
          source: {
            ...source,
            files: {
              ...source.files,
              [action.payload.fileId]: {
                ...source.files[action.payload.fileId],
                type: action.payload.type,
              },
            },
          },
        };
        state.hasEdited = true;
      }
    },
    activateFile(state, action: PayloadAction<FileId>) {
      if (state.projectSources?.source) {
        // We don't count activating a file as an edit,
        // as it doesn't meaningfully change the project state.
        state.projectSources = {
          ...state.projectSources,
          source: activateFileHelper(
            state.projectSources.source as MultiFileSource,
            action.payload
          ),
        };
      }
    },
    closeFile(state, action: PayloadAction<FileId>) {
      if (state.projectSources?.source) {
        // We don't count closing a file as an edit,
        // as it doesn't meaningfully change the project state.
        state.projectSources = {
          ...state.projectSources,
          source: closeFileHelper(
            state.projectSources.source as MultiFileSource,
            action.payload
          ),
        };
      }
    },
    deleteFile(
      state,
      action: PayloadAction<{fileId: FileId; isBlockedAbuse?: boolean}>
    ) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (!source.files[action.payload.fileId]) {
          // No-op if the file does not exist.
          return;
        }
        const deleteResult = deleteFileHelper({
          source,
          fileId: action.payload.fileId,
        });
        state.projectSources = {
          ...state.projectSources,
          source: deleteResult.newSource,
        };
        state.hasEdited = true;
      }
    },
    moveFile(
      state,
      action: PayloadAction<{fileId: FileId; folderId: FolderId}>
    ) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (
          !source.files[action.payload.fileId] ||
          source.files[action.payload.fileId].folderId ===
            action.payload.folderId
          // No-op if the file does not exist or is already in the target folder.
        ) {
          return;
        }
        state.projectSources = {
          ...state.projectSources,
          source: {
            ...source,
            files: {
              ...source.files,
              [action.payload.fileId]: {
                ...source.files[action.payload.fileId],
                folderId: action.payload.folderId,
              },
            },
          },
        };
        state.hasEdited = true;
      }
    },
    moveFolder(
      state,
      action: PayloadAction<{folderId: FolderId; parentId: FolderId}>
    ) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (
          !source.folders[action.payload.folderId] ||
          source.folders[action.payload.folderId].parentId ===
            action.payload.parentId
        ) {
          // No-op if the folder does not exist or is already in the target parent.
          return;
        }
        state.projectSources = {
          ...state.projectSources,
          source: {
            ...source,
            folders: {
              ...source.folders,
              [action.payload.folderId]: {
                ...source.folders[action.payload.folderId],
                parentId: action.payload.parentId,
              },
            },
          },
        };
        state.hasEdited = true;
      }
    },
    createNewFolder(
      state,
      action: PayloadAction<{folderName: string; parentId?: FolderId}>
    ) {
      if (state.projectSources?.source) {
        state.projectSources = {
          ...state.projectSources,
          source: createNewFolderHelper(
            state.projectSources.source as MultiFileSource,
            action.payload.folderName,
            action.payload.parentId
          ),
        };
        state.hasEdited = true;
      }
    },
    toggleOpenFolder(state, action: PayloadAction<FolderId>) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (!source.folders[action.payload]) {
          // No-op if the folder does not exist.
          return;
        }
        // We don't count toggling a folder as an edit,
        // as it doesn't meaningfully change the project state.
        state.projectSources = {
          ...state.projectSources,
          source: {
            ...source,
            folders: {
              ...source.folders,
              [action.payload]: {
                ...source.folders[action.payload],
                open: !source.folders[action.payload].open,
              },
            },
          },
        };
      }
    },
    deleteFolder(state, action: PayloadAction<FolderId>) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (!source.folders[action.payload]) {
          // No-op if the folder does not exist.
          return;
        }
        state.projectSources = {
          ...state.projectSources,
          source: deleteFolderHelper(source, action.payload),
        };
        state.hasEdited = true;
      }
    },
    renameFolder(
      state,
      action: PayloadAction<{folderId: FolderId; newName: string}>
    ) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (
          !source.folders[action.payload.folderId] ||
          source.folders[action.payload.folderId].name ===
            action.payload.newName
        ) {
          // No-op if the folder does not exist or the name is the same.
          return;
        }
        state.projectSources = {
          ...state.projectSources,
          source: {
            ...source,
            folders: {
              ...source.folders,
              [action.payload.folderId]: {
                ...source.folders[action.payload.folderId],
                name: action.payload.newName,
              },
            },
          },
        };
        state.hasEdited = true;
      }
    },
    rearrangeFiles(state, action: PayloadAction<FileId[]>) {
      if (state.projectSources?.source) {
        // We don't count rearranging files as an edit, as it doesn't
        // meaningfully change the project state.
        const source = state.projectSources.source as MultiFileSource;
        state.projectSources = {
          ...state.projectSources,
          source: {
            ...source,
            openFiles: action.payload,
          },
        };
      }
    },
    resetProjectMetadata(state) {
      // Reset the state that needs to be reset manually on level change.
      // Project source is handled elsewhere.
      state.hasEdited = false;
      state.viewingOldVersion = false;
      state.restoredOldVersion = false;
    },
    setLastSavedLabConfig(state, action: PayloadAction<LabConfig | undefined>) {
      state.lastSavedLabConfig = action.payload;
    },
  },
});

export const {
  setProjectSource,
  setPreviousVersionSource,
  setViewingOldVersion,
  setRestoredOldVersion,
  resetProjectMetadata,
  setHasEdited,
  setSource,
  setProjectTooLarge,
  createNewFile,
  createNewExternalFile,
  renameFile,
  saveFile,
  setFileType,
  activateFile,
  closeFile,
  deleteFile,
  moveFile,
  moveFolder,
  createNewFolder,
  toggleOpenFolder,
  deleteFolder,
  renameFolder,
  rearrangeFiles,
  setLastSavedLabConfig,
} = projectSlice.actions;

export default projectSlice.reducer;
