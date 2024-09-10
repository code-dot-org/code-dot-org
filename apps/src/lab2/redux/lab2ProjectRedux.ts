import {
  PayloadAction,
  ThunkAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import {AnyAction} from 'redux';

import {ProjectSources} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';

import Lab2Registry from '../Lab2Registry';

export interface Lab2ProjectState {
  projectSource: ProjectSources | undefined;
  viewingOldVersion: boolean;
  restoredOldVersion: boolean;
}

const initialState: Lab2ProjectState = {
  projectSource: undefined,
  viewingOldVersion: false,
  restoredOldVersion: false,
};

// THUNKS

// Store the project source in the redux store and tell the project manager
// to save it.
export const setAndSaveProjectSource = (
  projectSource: ProjectSources
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return dispatch => {
    dispatch(projectSlice.actions.setProjectSource(projectSource));
    if (Lab2Registry.getInstance().getProjectManager()) {
      Lab2Registry.getInstance().getProjectManager()?.save(projectSource);
    }
  };
};

export const loadVersion = createAsyncThunk(
  'lab2Project/loadVersion',
  async (payload: {versionId: string}, thunkAPI) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      // We need to ensure we save the existing project before loading a new one.
      await projectManager.flushSave();
      const sources = await projectManager.loadSources(payload.versionId);
      thunkAPI.dispatch(setPreviousVersionSource(sources));
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
      state.projectSource = action.payload;
    },
    setPreviousVersionSource(
      state,
      action: PayloadAction<ProjectSources | undefined>
    ) {
      state.projectSource = action.payload;
      state.viewingOldVersion = true;
    },
    setViewingOldVersion(state, action: PayloadAction<boolean>) {
      state.viewingOldVersion = action.payload;
    },
    setRestoredOldVersion(state, action: PayloadAction<boolean>) {
      state.restoredOldVersion = action.payload;
    },
  },
});

export const {
  setProjectSource,
  setPreviousVersionSource,
  setViewingOldVersion,
  setRestoredOldVersion,
} = projectSlice.actions;

export default projectSlice.reducer;
