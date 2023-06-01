// This is not yet a complete store for lab-related state, but it can
// be used to hold lab-specific information that is not available in any
// other existing redux store.  It also holds useful state for newer labs
// that use LabContainer.

import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Channel, ProjectManagerStorageType, Source} from './types';
import LabRegistry from './LabRegistry';
import ProjectManagerFactory from './projects/ProjectManagerFactory';
import {
  setProjectUpdatedAt,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  setProjectUpdatedSaved,
} from '../code-studio/projectRedux';

export interface LabState {
  isLoading: boolean;
  isPageError: boolean;
  channel: Channel | undefined;
  source: Source | undefined;
  labReadyForReload: boolean;
}

const initialState: LabState = {
  isLoading: false,
  isPageError: false,
  channel: undefined,
  source: undefined,
  labReadyForReload: false,
};

// Thunks
export const setUpForLevel = createAsyncThunk(
  'lab/setUpForLevel',
  async (payload: {levelId: number; scriptId: number}, thunkAPI) => {
    // Check for an existing project manager and clean it up, if it exists.
    const existingProjectManager =
      LabRegistry.getInstance().getProjectManager();
    if (existingProjectManager) {
      if (existingProjectManager.hasUnsavedChanges()) {
        // Force a save with the existing code before changing levels if there are unsaved changes.
        const state = thunkAPI.getState() as {lab: LabState};
        if (state.lab.source) {
          await existingProjectManager.save(state.lab.source, true);
        }
      }
      // Clear out any remaining enqueued saves from the existing project manager.
      existingProjectManager.destroy();
    }
    // Create a new project manager.
    const projectManager =
      await ProjectManagerFactory.getProjectManagerForLevel(
        ProjectManagerStorageType.REMOTE,
        payload.levelId,
        payload.scriptId
      );
    // Only set the project manager and initiate load
    // if this request hasn't been cancelled.
    if (thunkAPI.signal.aborted) {
      return;
    }
    LabRegistry.getInstance().setProjectManager(projectManager);
    await thunkAPI.dispatch(loadProject());
  }
);

export const loadProject = createAsyncThunk(
  'lab/loadProject',
  async (_: void, thunkAPI) => {
    const projectManager = LabRegistry.getInstance().getProjectManager();
    if (!projectManager) {
      return thunkAPI.rejectWithValue('No project manager found.');
    }
    // Set up event listeners.
    projectManager.addSaveStartListener(() =>
      thunkAPI.dispatch(setProjectUpdatedSaving())
    );
    projectManager.addSaveSuccessListener(channel => {
      thunkAPI.dispatch(setProjectUpdatedAt(channel.updatedAt));
      thunkAPI.dispatch(setChannel(channel));
    });
    projectManager.addSaveNoopListener(channel => {
      if (channel) {
        thunkAPI.dispatch(setProjectUpdatedAt(channel.updatedAt));
        thunkAPI.dispatch(setChannel(channel));
      } else {
        thunkAPI.dispatch(setProjectUpdatedSaved());
      }
    });
    projectManager.addSaveFailListener(() =>
      thunkAPI.dispatch(setProjectUpdatedError())
    );
    // Load channel and source.
    const projectResponse = await projectManager.load();
    if (!projectResponse.ok) {
      return thunkAPI.rejectWithValue(projectResponse);
    }
    const {source, channel} = await projectResponse.json();
    // Only set channel and sources if the request has not been cancelled.
    if (thunkAPI.signal.aborted) {
      return;
    }
    thunkAPI.dispatch(setChannel(channel));
    thunkAPI.dispatch(setSource(source));
    thunkAPI.dispatch(setLabReadyForReload(true));
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
    setLabReadyForReload(state, action: PayloadAction<boolean>) {
      state.labReadyForReload = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setUpForLevel.fulfilled, state => {
      state.isLoading = false;
    });
    builder.addCase(setUpForLevel.rejected, (state, action) => {
      // If the set up was aborted, that means another load got started
      // before we finished. Therefore we only set loading to false if the
      // action was not aborted.
      if (!action.meta.aborted) {
        state.isLoading = false;
      }
    });
    builder.addCase(setUpForLevel.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(loadProject.fulfilled, state => {
      state.isLoading = false;
    });
    builder.addCase(loadProject.rejected, (state, action) => {
      // If the set up was aborted, that means another load got started
      // before we finished. Therefore we only set loading to false if the
      // action was not aborted.
      if (!action.meta.aborted) {
        state.isLoading = false;
      }
    });
    builder.addCase(loadProject.pending, state => {
      state.isLoading = true;
    });
  },
});

export const {
  setIsLoading,
  setIsPageError,
  setChannel,
  setSource,
  setLabReadyForReload,
} = labSlice.actions;

export default labSlice.reducer;
