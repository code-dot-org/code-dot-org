import {PayloadAction, ThunkAction, createSlice} from '@reduxjs/toolkit';
import {AnyAction} from 'redux';

import {ProjectSources} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';

import Lab2Registry from '../Lab2Registry';

export interface Lab2ProjectState {
  projectSource: ProjectSources | undefined;
}

const initialState: Lab2ProjectState = {
  projectSource: undefined,
};

// THUNKS

// Store the project source in the redux store and tell the project manager
// to save it.
export const setAndSaveProjectSource = (
  projectSource: ProjectSources
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return dispatch => {
    dispatch(setProjectSource(projectSource));
    if (Lab2Registry.getInstance().getProjectManager()) {
      Lab2Registry.getInstance().getProjectManager()?.save(projectSource);
    }
  };
};

// SLICE

const projectSlice = createSlice({
  name: 'lab2Project',
  initialState,
  reducers: {
    setProjectSource(state, action: PayloadAction<ProjectSources | undefined>) {
      state.projectSource = action.payload;
    },
  },
});

export const {setProjectSource} = projectSlice.actions;

export default projectSlice.reducer;
