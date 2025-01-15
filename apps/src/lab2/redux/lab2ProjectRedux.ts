import {
  PayloadAction,
  ThunkAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import {AnyAction} from 'redux';

import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';

import Lab2Registry from '../Lab2Registry';

export interface Lab2ProjectState {
  projectSources: ProjectSources | undefined;
  viewingOldVersion: boolean;
  restoredOldVersion: boolean;
  hasEdited: boolean;
}

const initialState: Lab2ProjectState = {
  projectSources: undefined,
  viewingOldVersion: false,
  restoredOldVersion: false,
  hasEdited: false,
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
    resetProjectMetadata(state) {
      // Reset the state that needs to be reset manually on level change.
      // Project source is handled elsewhere.
      state.hasEdited = false;
      state.viewingOldVersion = false;
      state.restoredOldVersion = false;
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
} = projectSlice.actions;

export default projectSlice.reducer;
