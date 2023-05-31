// This is not yet a complete store for lab-related state, but it can
// be used to hold lab-specific information that is not available in any
// other existing redux store.  It also holds useful state for newer labs
// that use LabContainer.

import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Channel, ProjectManagerStorageType, Source} from './types';
import LabRegistry from './LabRegistry';
import ProjectManagerFactory from './projects/ProjectManagerFactory';

export interface LabState {
  isLoading: boolean;
  isPageError: boolean;
  channel: Channel | undefined;
  source: Source | undefined;
}

const initialState: LabState = {
  isLoading: false,
  isPageError: false,
  channel: undefined,
  source: undefined,
};

// Thunks
export const setUpForLevel = createAsyncThunk(
  'lab/setUpForLevel',
  async (payload: {levelId: number; scriptId: number}, thunkAPI) => {
    const projectManager =
      await ProjectManagerFactory.getProjectManagerForLevel(
        ProjectManagerStorageType.REMOTE,
        payload.levelId,
        payload.scriptId
      );
    if (thunkAPI.signal.aborted) {
      return;
    }
    // Only set the project manager and initiate load
    // if this request hasn't been cancelled.
    LabRegistry.getInstance().setProjectManager(projectManager);
    // set up event listeners
    // load
    const projectResponse = await projectManager.load();
    if (!projectResponse.ok) {
      return thunkAPI.rejectWithValue(projectResponse);
    }
    const {source, channel} = await projectResponse.json();
    if (thunkAPI.signal.aborted) {
      return;
    }
    console.log(`loaded sources and channel, storing in redux`);
    thunkAPI.dispatch(setChannel(channel));
    thunkAPI.dispatch(setSource(source));
  }
);

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setIsPageError(state, action: PayloadAction<boolean>) {
      state.isPageError = action.payload;
    },
    setChannel(state, action: PayloadAction<Channel>) {
      state.channel = action.payload;
    },
    setSource(state, action: PayloadAction<Source>) {
      state.source = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setUpForLevel.fulfilled, state => {
      console.log('set up for level fulfilled');
      state.isLoading = false;
    });
    builder.addCase(setUpForLevel.rejected, state => {
      console.log('set up for level rejected');
      state.isLoading = false;
    });
    builder.addCase(setUpForLevel.pending, state => {
      console.log('set up for level pending');
      state.isLoading = true;
    });
  },
});

export const {setIsLoading, setIsPageError, setChannel, setSource} =
  labSlice.actions;

export default labSlice.reducer;
