// This is not yet a complete store for lab-related state, but it can
// be used to hold lab-specific information that is not available in any
// other existing redux store.  It also holds useful state for newer labs
// that use LabContainer.

import {
  AnyAction,
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';

import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import {getCurrentLevel} from '../code-studio/progressReduxSelectors';
import {
  setProjectUpdatedAt,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  setProjectUpdatedSaved,
} from '../code-studio/projectRedux';
import {queryParams, updateQueryParam} from '../code-studio/utils';
import {RootState} from '../types/redux';
import HttpClient, {NetworkError} from '../util/HttpClient';

import {START_SOURCES} from './constants';
import Lab2Registry from './Lab2Registry';
import {
  getInitialValidationState,
  ValidationState,
} from './progress/ProgressManager';
import ProjectManager from './projects/ProjectManager';
import ProjectManagerFactory from './projects/ProjectManagerFactory';
import {getPredictResponse} from './projects/userLevelsApi';
import {LevelPropertiesValidator} from './responseValidators';
import {
  AppName,
  Channel,
  LevelProperties,
  ProjectManagerStorageType,
  ProjectSources,
} from './types';
import {LifecycleEvent} from './utils/LifecycleNotifier';

interface PageError {
  errorMessage: string;
  error?: Error;
  details?: object;
}

export interface LabState {
  // If we are currently loading common data for a project or level. Should only be used internally
  // by this Redux file.
  isLoadingProjectOrLevel: boolean;
  // If the lab is loading. Can be updated by lab-specific components.
  isLoading: boolean;
  // Error currently on the page, if present.
  pageError: PageError | undefined;
  // channel for the current project, or undefined if there is no current project.
  channel: Channel | undefined;
  // Initial sources for the current level, as loaded from the server. Subsequent changes to sources
  // while the project is being edited are managed by the Lab and Project Manager directly.
  initialSources: ProjectSources | undefined;
  // Validation status for the current level. This is used by the progress system to determine
  // what instructions to display and if the user has satisfied the validation conditions, if present.
  validationState: ValidationState;
  // Level properties for the current level.
  levelProperties: LevelProperties | undefined;
  // If this lab should presented in a "share" or "play-only" view, which may hide certain UI elements.
  isShareView: boolean | undefined;
}

const initialState: LabState = {
  isLoadingProjectOrLevel: false,
  isLoading: false,
  pageError: undefined,
  channel: undefined,
  initialSources: undefined,
  validationState: getInitialValidationState(),
  levelProperties: undefined,
  isShareView: undefined,
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
      userId?: number;
      scriptLevelId?: string;
    },
    thunkAPI
  ) => {
    Lab2Registry.getInstance()
      .getLifecycleNotifier()
      .notify(LifecycleEvent.LevelLoadStarted, payload.levelId);
    try {
      // Update properties for reporting as early as possible in case of errors.
      Lab2Registry.getInstance().getMetricsReporter().updateProperties({
        currentLevelId: payload.levelId,
        scriptId: payload.scriptId,
        channelId: payload.channelId,
      });

      await cleanUpProjectManager();
      const isViewingExemplar = getAppOptionsViewingExemplar();
      const isEditingExemplar = getAppOptionsEditingExemplar();

      // Load level properties if we have a levelPropertiesPath.
      const levelProperties = await loadLevelProperties(
        payload.levelPropertiesPath
      );

      Lab2Registry.getInstance()
        .getMetricsReporter()
        .updateProperties({appName: levelProperties.appName});

      const {isProjectLevel, usesProjects} = levelProperties;

      Lab2Registry.getInstance().setAppName(levelProperties.appName);

      if (!usesProjects) {
        // If projects are disabled on this level, we can skip loading projects data.
        setProjectAndLevelData(
          {levelProperties},
          thunkAPI.signal.aborted,
          thunkAPI.dispatch
        );
        return;
      }

      // If we are in start mode or are editing or viewing exemplars,
      // we don't use a channel id.
      // We can skip creating a project manager and just set the level data.
      const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
      if (isStartMode || isViewingExemplar || isEditingExemplar) {
        setProjectAndLevelData(
          {levelProperties},
          thunkAPI.signal.aborted,
          thunkAPI.dispatch
        );
        return;
      }

      // If we have a predict level, we should try to load the existing response.
      // We only can load predict responses if we have a script id.
      if (levelProperties.predictSettings?.isPredictLevel && payload.scriptId) {
        const predictResponse =
          (await getPredictResponse(payload.levelId, payload.scriptId)) || '';
        thunkAPI.dispatch(setLoadedPredictResponse(predictResponse));
      } else {
        // If this isn't a predict level, reset the response to an empty string
        // to avoid potentially confusing behavior.
        thunkAPI.dispatch(setLoadedPredictResponse(''));
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
              payload.userId,
              payload.scriptId,
              payload.scriptLevelId
            );

      // Only set the project manager and initiate load
      // if this request hasn't been cancelled.
      if (thunkAPI.signal.aborted) {
        return;
      }

      // We might be a teacher attempting to view a student level that hasn't been
      // started, and there is no project manager available.
      if (!projectManager) {
        // If the level hasn't been started, we can skip loading projects data.
        setProjectAndLevelData(
          {levelProperties},
          thunkAPI.signal.aborted,
          thunkAPI.dispatch
        );
        return;
      }

      // Set channel ID for reporting in case we hit an error and can't update the store.
      Lab2Registry.getInstance().getMetricsReporter().updateProperties({
        channelId: projectManager.getChannelId(),
      });

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
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Given a channel id and app name as the payload, set up the lab for that channel id.
// This consists of cleaning up the existing project manager (if applicable), then
// creating a project manager and loading the project data.
// This method is used for loading a lab that is not associated with a level.
// (This was previously used for /projectbeats).
// If we get an aborted signal, we will exit early.
export const setUpWithoutLevel = createAsyncThunk(
  'lab/setUpWithoutLevel',
  async (payload: {channelId: string; appName: AppName}, thunkAPI) => {
    try {
      // Update properties for reporting as early as possible in case of errors.
      Lab2Registry.getInstance().getMetricsReporter().updateProperties({
        channelId: payload.channelId,
        appName: payload.appName,
      });

      await cleanUpProjectManager();

      Lab2Registry.getInstance().setAppName(payload.appName);

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
          levelProperties: {id: 0, appName: payload.appName},
        },
        thunkAPI.signal.aborted,
        thunkAPI.dispatch
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Selectors

// If any load is currently in progress.
export const isLabLoading = (state: {lab: LabState}) =>
  state.lab.isLoadingProjectOrLevel || state.lab.isLoading;

// This may depend on more factors, such as share.
export const isReadOnlyWorkspace = (state: RootState) => {
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isEditingExemplarMode = getAppOptionsEditingExemplar();

  // We are always in edit mode if we are in start or editing exemplar mode.
  // Both of these modes have no channel.
  if (isStartMode || isEditingExemplarMode) {
    return false;
  }

  // Otherwise, we are in read only mode if we are not the owner of the channel,
  // the level is frozen, the level is a read only predict level, the level has been submitted.
  // or this is a lab that should be read only while running and the code is currently running.
  const isOwner = state.lab.channel?.isOwner;
  const isFrozen = !!state.lab.channel?.frozen;
  const readonlyPredictLevel = isReadonlyPredictLevel(state);
  const hasSubmitted = getCurrentLevel(state)?.status === LevelStatus.submitted;
  const isViewingOldVersion = state.lab2Project.viewingOldVersion;
  const isRunningAndReadonly =
    (state.lab2System.isRunning || state.lab2System.isValidating) &&
    shouldBeReadonlyWhileRunning(state);

  return (
    !isOwner ||
    isFrozen ||
    readonlyPredictLevel ||
    hasSubmitted ||
    isRunningAndReadonly ||
    isViewingOldVersion
  );
};

// If there is an error present on the page.
export const hasPageError = (state: {lab: LabState}) => {
  return state.lab.pageError !== undefined;
};

// If the share and remix buttons should be hidden for the lab. Defaults to true (hidden)
// if not specified.
export const shouldHideShareAndRemix = (state: {lab: LabState}): boolean => {
  const hideShareAndRemix = state.lab.levelProperties?.hideShareAndRemix;
  return hideShareAndRemix === undefined ? true : hideShareAndRemix;
};

export const isProjectTemplateLevel = (state: {lab: LabState}) =>
  !!state.lab.levelProperties?.projectTemplateLevelName;

// SLICE

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
    setValidationState(state, action: PayloadAction<ValidationState>) {
      state.validationState = {...action.payload};
    },
    // Update the level properties, initial sources, and channel simultaneously when the level changes.
    // These fields are updated together so that labs receive all updates at once.
    onLevelChange(
      state,
      action: PayloadAction<{
        channel?: Channel;
        levelProperties: LevelProperties;
        initialSources?: ProjectSources;
      }>
    ) {
      state.channel = action.payload.channel;
      state.levelProperties = action.payload.levelProperties;
      state.initialSources = action.payload.initialSources;
    },
    setIsShareView(state, action: PayloadAction<boolean>) {
      state.isShareView = action.payload;
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
        state.pageError = getErrorFromThunkAction(
          action,
          'setUpWithLevel failed'
        );
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
      // before we finished. Therefore we only set loading to false
      // and set the page error if the action was not aborted.
      if (!action.meta.aborted) {
        state.isLoadingProjectOrLevel = false;
        state.pageError = getErrorFromThunkAction(
          action,
          'setUpWithoutLevel failed'
        );
      }
    });
    builder.addCase(setUpWithoutLevel.pending, state => {
      state.isLoadingProjectOrLevel = true;
    });
  },
});

// Retrieve error details from a thunk action payload.
function getErrorFromThunkAction(
  action: AnyAction,
  defaultErrorMessage: string
): PageError {
  let errorMessage, error, details;

  if (action.meta.rejectedWithValue) {
    const payloadError = action.payload as Error;
    errorMessage = payloadError.message;
    error = payloadError;

    // Get additional details if the error or its cause is a network error.
    let networkError = undefined;
    if (payloadError instanceof NetworkError) {
      networkError = payloadError;
    } else if (
      payloadError.cause &&
      payloadError.cause instanceof NetworkError
    ) {
      networkError = payloadError.cause;
    }
    if (networkError) {
      details = networkError.getDetails();
    }
  } else {
    errorMessage = defaultErrorMessage;
    error = action.error as Error;
  }

  return {
    errorMessage,
    error,
    details,
  };
}

// HELPERS

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
  // Figure out if we should reset to start sources. This happens if the url parameter
  // ?reset=true is present.
  // This parameter is only used by levelbuilders.
  const resetParam = queryParams('reset');
  let resetToStartSources = false;
  if (resetParam === 'true') {
    // Remove the reset parameter from the url so we don't reset again.
    updateQueryParam('reset', undefined);
    resetToStartSources = true;
  }
  return await projectManager.load(resetToStartSources);
}

// Helper function to set the channel, source, and level data in redux.
// If aborted is true, we won't set anything in redux. Once
// we are done, we will mark the lab as ready for reload.
// This should be called from a thunk, which will provide its
// thunk dispatch method.
function setProjectAndLevelData(
  data: {
    levelProperties: LevelProperties;
    channel?: Channel;
    initialSources?: ProjectSources;
  },
  aborted: boolean,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) {
  // Only set channel and sources if the request has not been cancelled.
  if (aborted) {
    return;
  }
  Lab2Registry.getInstance()
    .getLifecycleNotifier()
    .notify(
      LifecycleEvent.LevelLoadCompleted,
      data.levelProperties,
      data.channel,
      data.initialSources
    );
  // Dispatch level change last so labs can react to the new level data
  // and new initial sources at once.
  dispatch(onLevelChange(data));
}

async function loadLevelProperties(
  levelPropertiesPath: string
): Promise<LevelProperties> {
  const response = await HttpClient.fetchJson<LevelProperties>(
    levelPropertiesPath,
    {},
    LevelPropertiesValidator
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

// Returns if the current state represents a predict level that should be read only.
// If the predict level code is not editable after submit or the user has not submitted a response,
// the predict level is read only.
function isReadonlyPredictLevel(state: RootState) {
  const isPredictLevel =
    state.lab.levelProperties?.predictSettings?.isPredictLevel || false;
  let isReadonlyPredictLevel = isPredictLevel;
  if (isPredictLevel) {
    const isEditableAfterSubmit =
      state.lab.levelProperties?.predictSettings?.codeEditableAfterSubmit ||
      false;
    const hasSubmittedPredictResponse = state.predictLevel.hasSubmittedResponse;
    // If the predict level code is not editable after submit or the user has not submitted a response,
    // the predict level is read only.
    isReadonlyPredictLevel =
      !isEditableAfterSubmit || !hasSubmittedPredictResponse;
  }
  return isReadonlyPredictLevel;
}

// Currently only Python Lab disables editing while code is running.
function shouldBeReadonlyWhileRunning(state: RootState) {
  return state.lab.levelProperties?.appName === 'pythonlab';
}

// This is an action that other reducers (specifically predictLevelRedux) can respond to.
export const setLoadedPredictResponse = createAction<string>(
  'lab/setLoadedPredictResponse'
);

export const {
  setIsLoading,
  setPageError,
  clearPageError,
  setValidationState,
  setIsShareView,
} = labSlice.actions;

// These should not be set outside of the lab slice.
const {setChannel, onLevelChange} = labSlice.actions;

export default labSlice.reducer;
