// This is not yet a complete store for lab-related state, but it can
// be used to hold lab-specific information that is not available in any
// other existing redux store.  It also holds useful state for newer labs
// that use LabContainer.

import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import {
  Channel,
  LevelData,
  LevelProperties,
  ProjectManagerStorageType,
  ProjectSources,
} from './types';
import LabRegistry from './LabRegistry';
import ProjectManagerFactory from './projects/ProjectManagerFactory';
import {
  setProjectUpdatedAt,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  setProjectUpdatedSaved,
} from '../code-studio/projectRedux';
import ProjectManager from './projects/ProjectManager';
import HttpClient from '../util/HttpClient';

interface LabState {
  // If we are currently loading a lab.
  isLoading: boolean;
  isPageError: boolean;
  // channel for the current project, or undefined if there is no current project.
  channel: Channel | undefined;
  // last saved source for the current project, or undefined if we have not loaded or saved yet.
  sources: ProjectSources | undefined;
  // Level data for the current level
  levelData: LevelData | undefined;
  // Whether the lab is ready for a reload.  This is used to manage the case where multiple loads
  // happen in a row, and we only want to reload the lab when we are done.
  labReadyForReload: boolean;
}

const initialState: LabState = {
  isLoading: false,
  isPageError: false,
  channel: undefined,
  sources: undefined,
  levelData: undefined,
  labReadyForReload: false,
};

// Thunks

// Set up the project manager for the given level and script,
// then load the project and store the channel and source in redux.
// If we get an aborted signal, we will exit early.
export const setUpForLevel = createAsyncThunk(
  'lab/setUpForLevel',
  async (
    payload: {levelId: number; scriptId?: number; levelPropertiesPath: string},
    thunkAPI
  ) => {
    // Check for an existing project manager and clean it up, if it exists.
    const existingProjectManager =
      LabRegistry.getInstance().getProjectManager();
    // Save any usaved code and clear out any remaining enqueued
    // saves from the existing project manager.
    await existingProjectManager?.cleanUp();

    // Load level properties
    const levelProperties = await loadLevelProperties(
      payload.levelPropertiesPath
    );

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
    // Load channel and source.
    const {sources, channel} = await setUpAndLoadProject(
      projectManager,
      thunkAPI.dispatch
    );
    setProjectAndLevelData(
      {sources, channel, levelData: levelProperties.levelData},
      thunkAPI.signal.aborted,
      thunkAPI.dispatch
    );
  }
);

// Load the project from the existing project manager and store the channel
// and source in redux.
// If we get an aborted signal, we will exit early.
export const loadProject = createAsyncThunk(
  'lab/loadProject',
  async (_: void, thunkAPI) => {
    const projectManager = LabRegistry.getInstance().getProjectManager();
    if (!projectManager) {
      return thunkAPI.rejectWithValue('No project manager found.');
    }
    // Load channel and source.
    const {sources, channel} = await setUpAndLoadProject(
      projectManager,
      thunkAPI.dispatch
    );
    setProjectAndLevelData(
      {sources, channel},
      thunkAPI.signal.aborted,
      thunkAPI.dispatch
    );
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
    setSources(state, action: PayloadAction<ProjectSources>) {
      state.sources = action.payload;
    },
    setLevelData(state, action: PayloadAction<LevelData>) {
      state.levelData = action.payload;
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

// Helper function to add event listeners to the project manager
// and load the project. Returns the project load response.
// This should be called from a thunk, which will provide its
// thunk dispatch method.
async function setUpAndLoadProject(
  projectManager: ProjectManager,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) {
  projectManager.addSaveStartListener(() =>
    dispatch(setProjectUpdatedSaving())
  );
  projectManager.addSaveSuccessListener((channel, source) => {
    dispatch(setProjectUpdatedAt(channel.updatedAt));
    dispatch(setSources(source));
    dispatch(setChannel(channel));
  });
  projectManager.addSaveNoopListener(channel => {
    if (channel) {
      dispatch(setProjectUpdatedAt(channel.updatedAt));
      dispatch(setChannel(channel));
    } else {
      dispatch(setProjectUpdatedSaved());
    }
  });
  projectManager.addSaveFailListener(() => dispatch(setProjectUpdatedError()));
  return await projectManager.load();
}

// Helper function to set the channel, source, and level data in redux.
// If aborted is true, we won't set anything in redux. Once
// we are done, we will mark the lab as ready for reload.
// This should be called from a thunk, which will provide its
// thunk dispatch method.
function setProjectAndLevelData(
  data: {
    channel: Channel;
    sources?: ProjectSources;
    levelData?: LevelData;
  },
  aborted: boolean,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) {
  // Only set channel and sources if the request has not been cancelled.
  if (aborted) {
    return;
  }
  const {channel, sources, levelData} = data;
  dispatch(setChannel(channel));

  if (sources) {
    dispatch(setSources(sources));
  }
  if (levelData) {
    dispatch(setLevelData(levelData));
  }

  dispatch(setLabReadyForReload(true));
}

async function loadLevelProperties(
  levelPropertiesPath: string
): Promise<LevelProperties> {
  const response = await HttpClient.fetchJson<LevelProperties>(
    levelPropertiesPath
  );
  return response.value;
}

export const {
  setIsLoading,
  setIsPageError,
  setChannel,
  setSources,
  setLevelData,
  setLabReadyForReload,
} = labSlice.actions;

export default labSlice.reducer;
