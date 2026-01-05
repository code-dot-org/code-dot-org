import {
  PayloadAction,
  ThunkAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import {AnyAction} from 'redux';

import type {AppName} from '@code-dot-org/api/projects';
import {
  LabConfig,
  MultiFileSource,
  ProjectSources,
} from '@code-dot-org/api/sources';

import LabRegistry from '../LabRegistry';
import type {AppDispatch, RootState} from '../redux/store';

export interface LabProjectState {
  projectSources: ProjectSources | undefined;
  viewingOldVersion: boolean;
  restoredOldVersion: boolean;
  hasEdited: boolean;
  projectTooLarge: boolean;
  lastSavedLabConfig: LabConfig | undefined;
}

const initialState: LabProjectState = {
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
  forceNewVersion: boolean = false,
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return dispatch => {
    dispatch(projectSlice.actions.setProjectSource(projectSources));
    dispatch(
      projectSlice.actions.setLastSavedLabConfig(projectSources.labConfig),
    );
    if (LabRegistry.projectManager) {
      LabRegistry.projectManager?.save(
        projectSources,
        forceSave,
        forceNewVersion,
      );
    }
  };
};

export const setAndSaveSource = (
  source: MultiFileSource,
  forceSave: boolean = false,
  forceNewVersion: boolean = false,
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(setSource(source));
    const projectSources = getState().labProject.projectSources;
    if (LabRegistry.projectManager && projectSources) {
      LabRegistry.projectManager?.save(
        projectSources,
        forceSave,
        forceNewVersion,
      );
    }
  };
};

export const loadVersion = createAsyncThunk(
  'labProject/loadVersion',
  async (
    payload: {
      appName: AppName;
      versionId: string;
      startSources: ProjectSources;
    },
    thunkAPI,
  ) => {
    const projectManager = LabRegistry.projectManager;
    if (projectManager) {
      // We need to ensure we save the existing project before loading a new one.
      await projectManager.flushSave();
      // Fall back to start source if we can't load the version.
      const sources =
        (await projectManager.loadSources(
          payload.appName,
          payload.versionId,
        )) || payload.startSources;
      thunkAPI.dispatch(setPreviousVersionSource(sources));
    }
  },
);

export const previewStartSources = createAsyncThunk(
  'labProject/previewStartSources',
  async (payload: {startSources: ProjectSources}, thunkAPI) => {
    const projectManager = LabRegistry.projectManager;
    if (projectManager) {
      // We need to ensure we save the existing project before loading the start source.
      await projectManager.flushSave();
      thunkAPI.dispatch(setPreviousVersionSource(payload.startSources));
    }
  },
);

export const resetToCurrentVersion = createAsyncThunk(
  'labProject/resetToActiveVersion',
  async (payload: {appName: AppName}, thunkAPI) => {
    const projectManager = LabRegistry.projectManager;
    if (projectManager) {
      const sources = await projectManager.loadSources(payload.appName);
      thunkAPI.dispatch(setProjectSource(sources));
      thunkAPI.dispatch(setViewingOldVersion(false));
    }
  },
);

export const changeProjectType = createAsyncThunk<
  void,
  {newSources: ProjectSources},
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  'labProject/changeProjectType',
  async (payload: {newSources: ProjectSources}, thunkAPI) => {
    const projectManager = LabRegistry.projectManager;
    if (projectManager) {
      // We need to ensure we save the existing project before loading a new one.
      await projectManager.flushSave();
      thunkAPI.dispatch(
        setAndSaveProjectSources(
          payload.newSources,
          true,
          true,
        ) as unknown as AnyAction,
      );
    }
  },
);

// SLICE

const projectSlice = createSlice({
  name: 'labProject',
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
      action: PayloadAction<ProjectSources | undefined>,
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
} = projectSlice.actions;

export default projectSlice;
