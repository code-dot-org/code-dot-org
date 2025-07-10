import {FileId, FolderId} from '@codebridge/types';
import {
  PayloadAction,
  ThunkAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import {isEqual} from 'lodash';
import {AnyAction} from 'redux';

import {
  LabConfig,
  MultiFileSource,
  ProjectSources,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import Lab2Registry from '../Lab2Registry';
import {
  activateFileHelper,
  closeFileHelper,
  createNewFileHelper,
  createNewFolderHelper,
  deleteFileHelper,
  deleteFolderHelper,
} from '../utils/multiFileSourceEditUtils';

import {isReadOnlyWorkspace} from './lab2ReduxSelectors';

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

// THUNKS

// Store the project source in the redux store and tell the project manager
// to save it.
export const setAndSaveProjectSources = (
  projectSources: ProjectSources,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return dispatch => {
    dispatch(projectSlice.actions.setProjectSource(projectSources));
    dispatch(
      projectSlice.actions.setLastSavedLabConfig(projectSources.labConfig)
    );
    if (Lab2Registry.getInstance().getProjectManager()) {
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save(projectSources, forceSave, forceNewVersion);
    }
  };
};

export const setAndSaveSource = (
  source: MultiFileSource,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(setSource(source));
    const projectSources = getState().lab2Project.projectSources;
    if (Lab2Registry.getInstance().getProjectManager() && projectSources) {
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save(projectSources, forceSave, forceNewVersion);
    }
  };
};

export const updateAndSaveSource = createAsyncThunk<
  void,
  {
    updateCallback: (source: MultiFileSource) => MultiFileSource;
    forceSave?: boolean;
    forceNewVersion?: boolean;
  },
  {dispatch: AppDispatch; state: RootState}
>('lab2Project/updateAndSaveSource', async (payload, thunkAPI) => {
  const currentSource = thunkAPI.getState().lab2Project.projectSources?.source;
  if (!currentSource) {
    return;
  }
  const updatedSource = payload.updateCallback(
    currentSource as MultiFileSource
  );
  const hasEdited = thunkAPI.getState().lab2Project.hasEdited;
  if (!hasEdited) {
    const newSourceHasEdits = !isEqual(currentSource, updatedSource);
    if (newSourceHasEdits) {
      thunkAPI.dispatch(setHasEdited(true));
    }
  }
  thunkAPI.dispatch(setSource(updatedSource));
  const projectSources = thunkAPI.getState().lab2Project.projectSources;
  const isReadOnly = isReadOnlyWorkspace(thunkAPI.getState());
  if (
    Lab2Registry.getInstance().getProjectManager() &&
    projectSources &&
    !isReadOnly
  ) {
    Lab2Registry.getInstance()
      .getProjectManager()
      ?.save(projectSources, payload.forceSave, payload.forceNewVersion);
  }
});

export const loadVersion = createAsyncThunk(
  'lab2Project/loadVersion',
  async (
    payload: {versionId: string; startSources: ProjectSources},
    thunkAPI
  ) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      // We need to ensure we save the existing project before loading a new one.
      await projectManager.flushSave();
      // Fall back to start source if we can't load the version.
      const sources =
        (await projectManager.loadSources(payload.versionId)) ||
        payload.startSources;
      thunkAPI.dispatch(setPreviousVersionSource(sources));
    }
  }
);

export const previewStartSources = createAsyncThunk(
  'lab2Project/previewStartSources',
  async (payload: {startSources: ProjectSources}, thunkAPI) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      // We need to ensure we save the existing project before loading the start source.
      await projectManager.flushSave();
      thunkAPI.dispatch(setPreviousVersionSource(payload.startSources));
    }
  }
);

export const resetToCurrentVersion = createAsyncThunk(
  'lab2Project/resetToActiveVersion',
  async (_, thunkAPI) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      const sources = await projectManager.loadSources();
      thunkAPI.dispatch(setProjectSource(sources));
      thunkAPI.dispatch(setViewingOldVersion(false));
    }
  }
);

export const changeProjectType = createAsyncThunk<
  void,
  {newSources: ProjectSources},
  {dispatch: AppDispatch; state: RootState}
>('lab2Project/changeProjectType', async (payload, thunkAPI) => {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  if (projectManager) {
    // We need to ensure we save the existing project before loading a new one.
    await projectManager.flushSave();
    thunkAPI.dispatch(setAndSaveProjectSources(payload.newSources, true, true));
  }
});

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
          source: createNewFileHelper(
            state.projectSources?.source as MultiFileSource,
            action.payload.fileName,
            action.payload.folderId,
            action.payload.contents
          ),
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
    deleteFile(state, action: PayloadAction<FileId>) {
      if (state.projectSources?.source) {
        const source = state.projectSources.source as MultiFileSource;
        if (!source.files[action.payload]) {
          // No-op if the file does not exist.
          return;
        }
        state.projectSources = {
          ...state.projectSources,
          source: deleteFileHelper(source, action.payload),
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
      action: PayloadAction<{folderName: string; parentId?: string}>
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
} = projectSlice.actions;

export default projectSlice.reducer;
