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
  AppName,
  Channel,
  LevelData,
  ServerLevelProperties,
  ProjectManagerStorageType,
  ProjectSources,
  LevelProperties,
} from './types';
import Lab2Registry from './Lab2Registry';
import ProjectManagerFactory from './projects/ProjectManagerFactory';
import {
  setProjectUpdatedAt,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  setProjectUpdatedSaved,
} from '../code-studio/projectRedux';
import ProjectManager from './projects/ProjectManager';
import HttpClient from '../util/HttpClient';
import {convertOptionalStringToBoolean} from '../types/utils';
import {
  initialValidationState,
  ValidationState,
} from './progress/ProgressManager';

export interface LabState {
  // If we are currently loading common data for a project or level. Should only be used internally
  // by this Redux file.
  isLoadingProjectOrLevel: boolean;
  // If the lab is loading. Can be updated by lab-specific components.
  isLoading: boolean;
  // Error currently on the page, if present.
  pageError:
    | {
        errorMessage: string;
        error?: Error;
        details?: object;
      }
    | undefined;
  // channel for the current project, or undefined if there is no current project.
  channel: Channel | undefined;
  // Initial sources for the current level, as loaded from the server. Subsequent changes to sources
  // while the project is being edited are managed by the Lab and Project Manager directly.
  initialSources: ProjectSources | undefined;
  levelProperties: LevelProperties;
  // Validation status for the current level. This is used by the progress system to determine
  // what instructions to display and if the user has satisfied the validation conditions, if present.
  validationState: ValidationState;
}

const initialState: LabState = {
  isLoadingProjectOrLevel: false,
  isLoading: false,
  pageError: undefined,
  channel: undefined,
  initialSources: undefined,
  validationState: {...initialValidationState},
  levelProperties: {
    isProjectLevel: false,
    hideShareAndRemix: true,
    levelData: undefined,
    appName: undefined,
  },
};

// Thunks

// Set up the lab properties and project manager for the given level (and optional script),
// then load the project and store the channel and source in redux.
// If we are given a channel id, we will use that to load the project, otherwise we will
// get the channel id based on the level and script id.
// If we get an aborted signal, we will exit early.
export const setUpWithLevel = createAsyncThunk(
  'lab/setUpWithLevel',
  async (
    payload: {
      levelId: number;
      scriptId?: number;
      levelPropertiesPath: string;
      channelId?: string;
    },
    thunkAPI
  ) => {
    await cleanUpProjectManager();

    // Load level properties if we have a levelPropertiesPath.
    const levelProperties = await loadLevelProperties(
      payload.levelPropertiesPath
    );
    const isProjectLevel = convertOptionalStringToBoolean(
      levelProperties.isProjectLevel,
      false
    );
    const disableProjects = convertOptionalStringToBoolean(
      levelProperties.disableProjects,
      false
    );

    if (disableProjects) {
      // If projects are disabled on this level, we can skip loading projects data.
      setProjectAndLevelData(
        {levelProperties},
        thunkAPI.signal.aborted,
        thunkAPI.dispatch
      );
      return;
    }

    // Create a new project manager. If we have a channel id,
    // default to loading the project for that channel. Otherwise
    // create a project manager for the given level and script id.
    const projectManager =
      payload.channelId && isProjectLevel
        ? ProjectManagerFactory.getProjectManager(
            ProjectManagerStorageType.REMOTE,
            payload.channelId
          )
        : await ProjectManagerFactory.getProjectManagerForLevel(
            ProjectManagerStorageType.REMOTE,
            payload.levelId,
            payload.scriptId
          );
    // Only set the project manager and initiate load
    // if this request hasn't been cancelled.
    if (thunkAPI.signal.aborted) {
      return;
    }
    Lab2Registry.getInstance().setProjectManager(projectManager);
    // Load channel and source.
    const {sources, channel} = await setUpAndLoadProject(
      projectManager,
      thunkAPI.dispatch
    );
    setProjectAndLevelData(
      {initialSources: sources, channel, levelProperties},
      thunkAPI.signal.aborted,
      thunkAPI.dispatch
    );
  }
);

// Given a channel id and app name as the payload, set up the lab for that channel id.
// This consists of cleaning up the existing project manager (if applicable), then
// creating a project manager and loading the project data.
// This method is used for loading a lab that is not associated with a level
// (e.g., /projectbeats).
// If we get an aborted signal, we will exit early.
export const setUpWithoutLevel = createAsyncThunk(
  'lab/setUpWithoutLevel',
  async (payload: {channelId: string; appName: AppName}, thunkAPI) => {
    await cleanUpProjectManager();

    // Create the new project manager.
    const projectManager = ProjectManagerFactory.getProjectManager(
      ProjectManagerStorageType.REMOTE,
      payload.channelId
    );
    Lab2Registry.getInstance().setProjectManager(projectManager);

    // Load channel and source.
    const {sources, channel} = await setUpAndLoadProject(
      projectManager,
      thunkAPI.dispatch
    );
    setProjectAndLevelData(
      {
        initialSources: sources,
        channel,
        levelProperties: {appName: payload.appName},
      },
      thunkAPI.signal.aborted,
      thunkAPI.dispatch
    );
  }
);

// Selectors

// If any load is currently in progress.
export const isLabLoading = (state: {lab: LabState}) =>
  state.lab.isLoadingProjectOrLevel || state.lab.isLoading;

// This may depend on more factors, such as share.
export const isReadOnlyWorkspace = (state: {lab: LabState}) => {
  return !state.lab.channel?.isOwner;
};

// If there is an error present on the page.
export const hasPageError = (state: {lab: LabState}) => {
  return state.lab.pageError !== undefined;
};

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setPageError(
      state,
      action: PayloadAction<{
        errorMessage: string;
        error?: Error;
        details?: object;
      }>
    ) {
      state.pageError = action.payload;
    },
    clearPageError(state) {
      state.pageError = undefined;
    },
    setChannel(state, action: PayloadAction<Channel | undefined>) {
      state.channel = action.payload;
    },
    setHideShareAndRemix(state, action: PayloadAction<boolean>) {
      state.levelProperties.hideShareAndRemix = action.payload;
    },
    setIsProjectLevel(state, action: PayloadAction<boolean>) {
      state.levelProperties.isProjectLevel = action.payload;
    },
    setValidationState(state, action: PayloadAction<ValidationState>) {
      state.validationState = {...action.payload};
    },
    // Update the level data and initial sources simultaneously when the level changes.
    // These fields are updated together so that labs receive all updates at once.
    onLevelChange(
      state,
      action: PayloadAction<{
        channel?: Channel;
        appName?: AppName;
        levelData?: LevelData;
        initialSources?: ProjectSources;
      }>
    ) {
      state.channel = action.payload.channel;
      state.levelProperties.appName = action.payload.appName;
      state.levelProperties.levelData = action.payload.levelData;
      state.initialSources = action.payload.initialSources;
    },
  },
  extraReducers: builder => {
    builder.addCase(setUpWithLevel.fulfilled, state => {
      state.isLoadingProjectOrLevel = false;
    });
    builder.addCase(setUpWithLevel.rejected, (state, action) => {
      // If the set up was aborted, that means another load got started
      // before we finished. Therefore we only set loading to false if the
      // action was not aborted.
      if (!action.meta.aborted) {
        state.isLoadingProjectOrLevel = false;
        state.pageError = {
          errorMessage: 'setUpWithLevel failed',
          error: action.error as Error,
        };
      }
    });
    builder.addCase(setUpWithLevel.pending, state => {
      state.isLoadingProjectOrLevel = true;
    });
    builder.addCase(setUpWithoutLevel.fulfilled, state => {
      state.isLoadingProjectOrLevel = false;
    });
    builder.addCase(setUpWithoutLevel.rejected, (state, action) => {
      // If the set up was aborted, that means another load got started
      // before we finished. Therefore we only set loading to false if the
      // action was not aborted.
      if (!action.meta.aborted) {
        state.isLoadingProjectOrLevel = false;
        state.pageError = {
          errorMessage: 'setUpWithoutLevel failed',
          error: action.error as Error,
        };
      }
    });
    builder.addCase(setUpWithoutLevel.pending, state => {
      state.isLoadingProjectOrLevel = true;
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
  projectManager.addSaveSuccessListener(channel => {
    dispatch(setProjectUpdatedAt(channel.updatedAt));
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
    channel?: Channel;
    initialSources?: ProjectSources;
    levelProperties?: ServerLevelProperties;
  },
  aborted: boolean,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) {
  // Only set channel and sources if the request has not been cancelled.
  if (aborted) {
    return;
  }
  const {channel, initialSources, levelProperties} = data;
  if (levelProperties) {
    const hideShareAndRemix = convertOptionalStringToBoolean(
      levelProperties.hideShareAndRemix,
      /* defaultValue*/ true
    );
    dispatch(setHideShareAndRemix(hideShareAndRemix));
    const isProjectLevel = convertOptionalStringToBoolean(
      levelProperties.isProjectLevel,
      /* defaultValue*/ false
    );
    dispatch(setIsProjectLevel(isProjectLevel));
  } else {
    // set default values to clear out any previous values
    dispatch(setHideShareAndRemix(true));
    dispatch(setIsProjectLevel(false));
  }
  // Dispatch level change last so labs can react to the new level data
  // and new initial sources at once.
  dispatch(
    onLevelChange({
      appName: levelProperties?.appName,
      levelData: levelProperties?.levelData,
      channel,
      initialSources,
    })
  );
}

async function loadLevelProperties(
  levelPropertiesPath: string
): Promise<ServerLevelProperties> {
  const response = await HttpClient.fetchJson<ServerLevelProperties>(
    levelPropertiesPath
  );
  return response.value;
}

async function cleanUpProjectManager() {
  // Check for an existing project manager and clean it up, if it exists.
  const existingProjectManager = Lab2Registry.getInstance().getProjectManager();
  // Save any unsaved code and clear out any remaining enqueued
  // saves from the existing project manager.
  await existingProjectManager?.cleanUp();
  Lab2Registry.getInstance().clearProjectManager();
}

export const {setIsLoading, setPageError, clearPageError, setValidationState} =
  labSlice.actions;

// These should not be set outside of the lab slice.
const {setHideShareAndRemix, setIsProjectLevel, setChannel, onLevelChange} =
  labSlice.actions;

export default labSlice.reducer;
