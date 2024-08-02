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
  viewSource: ProjectSources | undefined;
}

const initialState: Lab2ProjectState = {
  projectSource: undefined,
  viewSource: undefined,
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

export const loadForViewVersion = createAsyncThunk(
  'lab2Project/loadForViewVersion',
  async (payload: {versionId: string}, thunkAPI) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      const sources = await projectManager.loadSources(payload.versionId);
      thunkAPI.dispatch(setViewSource(sources));
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
    setViewSource(state, action: PayloadAction<ProjectSources | undefined>) {
      state.viewSource = action.payload;
    },
  },
});

export const {setProjectSource, setViewSource} = projectSlice.actions;

export default projectSlice.reducer;
