import {createSlice, createAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {PayloadAction, AnyAction, Slice} from '@reduxjs/toolkit';

import {
  HttpClient,
  NetworkError,
  getPublicCaching,
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@code-dot-org/api';
import type {AppName} from '@code-dot-org/api/projects';
import {OPEN_ENDED_LAB2_PROJECT_TYPES} from '@code-dot-org/api/projects';
import {getPredictResponse} from '@code-dot-org/api/userLevels';
import type {Validation, ValidationState} from '@code-dot-org/progress';
import {getInitialValidationState, LevelStatus} from '@code-dot-org/progress';
import {progressActions} from '@code-dot-org/progress/redux';
import {ProjectManagerFactory, ProjectManager} from '@code-dot-org/projects';
import type {Channel, ProjectSources} from '@code-dot-org/projects';
import {projectActions} from '@code-dot-org/projects/redux';
import {CourseRoles} from '@code-dot-org/user';
import {currentUserActions} from '@code-dot-org/user/redux';

import LabRegistry from '../LabRegistry';
import {LifecycleEvent} from '../LifecycleNotifier';
import type {RootState, AppDispatch} from '../redux/store';
import {LevelPropertiesValidator} from '../responseValidators';
import type {LevelProperties, PartialUserAppOptions} from '../types';
import {queryParams, updateQueryParam} from '../utils/queryParams';

import {setProjectTooLarge} from './labProjectSlice';

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
  // If we are currently loading the theme
  isLoadingTheme: boolean;
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
  // Script id for the current level.
  scriptId: number | undefined;
  // If this lab should presented in a "share" or "play-only" view, which may hide certain UI elements.
  isShareView: boolean | undefined;
  // If this lab is blocked because abuse score >= 15.
  isBlockedAbuse: boolean | undefined;
  // If this lab/project is blocked for project non-owners (excluding owner's teacher).
  projectSharingDisabled: boolean | undefined;
  overrideValidations: Validation[] | undefined;
  permissions: string[];
}

const initialState: LabState = {
  isLoadingProjectOrLevel: false,
  isLoading: false,
  isLoadingTheme: false,
  pageError: undefined,
  channel: undefined,
  initialSources: undefined,
  validationState: getInitialValidationState(),
  levelProperties: undefined,
  scriptId: undefined,
  isShareView: undefined,
  isBlockedAbuse: undefined,
  projectSharingDisabled: undefined,
  overrideValidations: undefined,
  permissions: [],
};

// Slice

const slice: Slice<LabState> = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setIsLoadingTheme(state, action: PayloadAction<boolean>) {
      state.isLoadingTheme = action.payload;
    },
    setPageError(
      state,
      action: PayloadAction<{
        errorMessage: string;
        error?: Error;
        details?: object;
      }>,
    ) {
      state.pageError = action.payload;
    },
    clearPageError(state) {
      state.pageError = undefined;
    },
    setChannel(state, action: PayloadAction<Channel | undefined>) {
      state.channel = action.payload;
    },
    setScriptId(state, action: PayloadAction<number | undefined>) {
      state.scriptId = action.payload;
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
        abuseScore?: number;
        sharingDisabled?: boolean;
      }>,
    ) {
      const levelProperties = action.payload.levelProperties;
      state.channel = action.payload.channel;
      // Cast needed because LevelProperties contains readonly nested types (BlockOptionsList)
      // that conflict with Immer's WritableDraft requirements
      state.levelProperties = levelProperties as typeof state.levelProperties;
      state.initialSources = action.payload.initialSources;
      if (typeof action.payload.abuseScore === 'number') {
        state.isBlockedAbuse = action.payload.abuseScore >= 15 ? true : false;
      }
      state.projectSharingDisabled =
        action.payload.sharingDisabled &&
        OPEN_ENDED_LAB2_PROJECT_TYPES.includes(levelProperties.appName);
    },
    setIsShareView(state, action: PayloadAction<boolean>) {
      state.isShareView = action.payload;
    },
    setOverrideValidations(
      state,
      action: PayloadAction<Validation[] | undefined>,
    ) {
      state.overrideValidations = action.payload;
    },
    setPermissions(state, action: PayloadAction<string[]>) {
      state.permissions = action.payload;
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
          'setUpWithLevel failed',
        );
      }
    });
    builder.addCase(setUpWithLevel.pending, state => {
      state.isLoadingProjectOrLevel = true;
    });
  },
});

// Thunks

// Set up the lab properties and project manager for the given level (and optional script),
// then load the project and store the channel and source in redux.
// If we are given a channel id, we will use that to load the project, otherwise we will
// get the channel id based on the level and script id.
// If we get an aborted signal, we will exit early.
export const setUpWithLevel = createAsyncThunk<
  void,
  {
    levelId: number;
    scriptId?: number;
    levelPropertiesPath: string;
    userAppOptionsPath?: string;
    channelId?: string;
    userId?: number;
    scriptLevelId?: string;
  },
  {dispatch: AppDispatch; state: RootState}
>('lab/setUpWithLevel', async (payload, thunkAPI) => {
  LabRegistry.lifecycleNotifier.notify(
    LifecycleEvent.LevelLoadStarted,
    payload.levelId,
  );
  try {
    // Update properties for reporting as early as possible in case of errors.
    LabRegistry.metricsReporter.updateProperties({
      currentLevelId: payload.levelId,
      scriptId: payload.scriptId,
      channelId: payload.channelId,
    });

    await cleanUpProjectManager();
    const isViewingExemplar = getAppOptionsViewingExemplar();
    const isEditingExemplar = getAppOptionsEditingExemplar();

    // Load level properties if we have a levelPropertiesPath.
    const levelProperties = await loadLevelProperties(
      payload.levelPropertiesPath,
    );
    thunkAPI.dispatch(setScriptId(payload.scriptId));

    // Massage levelProperties to match aiTutor's format
    // TODO: handle aitutor reducer upstream
    //const aiTutorLevel = mapLevelPropertiesToAITutorLevel(levelProperties);
    //thunkAPI.dispatch(setLevel(aiTutorLevel));

    LabRegistry.metricsReporter.updateProperties({
      appName: levelProperties.appName,
    });

    const {isProjectLevel, usesProjects} = levelProperties;

    LabRegistry.appName = levelProperties.appName;

    // If we are cached, and there is a user app options path because we are in a script
    // level, then make an async call to the server to find out whether the user is an
    // instructor, and if they are, then update the user role.  This is needed for the
    // teacher panel to appear in cached levels.
    if (getPublicCaching()) {
      if (payload.userAppOptionsPath) {
        loadUserAppOptions(payload.userAppOptionsPath).then(result => {
          if (result.isInstructor) {
            thunkAPI.dispatch(
              currentUserActions.setUserRoleInCourse(CourseRoles.Instructor),
            );
          }
        });
      }
    }

    if (!usesProjects) {
      // If projects are disabled on this level, we can skip loading projects data.
      setProjectAndLevelData(
        {levelProperties},
        thunkAPI.signal.aborted,
        thunkAPI.dispatch,
        thunkAPI.getState,
      );
      return;
    }

    // If we are in a block edit mode or are editing or viewing exemplars,
    // we don't use a channel id.
    // We can skip creating a project manager and just set the level data.
    const isEditMode = !!getAppOptionsEditBlocks();
    if (isEditMode || isViewingExemplar || isEditingExemplar) {
      setProjectAndLevelData(
        {levelProperties},
        thunkAPI.signal.aborted,
        thunkAPI.dispatch,
        thunkAPI.getState,
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
            payload.channelId,
            thunkAPI.getState().lab.isShareView,
          )
        : await ProjectManagerFactory.getProjectManagerForLevel(
            payload.levelId,
            payload.userId,
            payload.scriptId,
            payload.scriptLevelId,
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
        thunkAPI.dispatch,
        thunkAPI.getState,
      );
      return;
    }

    // Set channel ID for reporting in case we hit an error and can't update the store.
    LabRegistry.metricsReporter.updateProperties({
      channelId: projectManager.getChannelId(),
    });

    LabRegistry.projectManager = projectManager;

    // Load channel and source.
    const {sources, channel, abuseScore, sharingDisabled} =
      await setUpAndLoadProject(
        LabRegistry.appName,
        projectManager,
        thunkAPI.dispatch,
      );
    setProjectAndLevelData(
      {
        initialSources: sources,
        channel,
        levelProperties,
        abuseScore,
        sharingDisabled,
      },
      thunkAPI.signal.aborted,
      thunkAPI.dispatch,
      thunkAPI.getState,
    );
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

// Retrieve error details from a thunk action payload.
function getErrorFromThunkAction(
  action: AnyAction,
  defaultErrorMessage: string,
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
  appName: AppName,
  projectManager: ProjectManager,
  dispatch: AppDispatch,
) {
  projectManager.addSaveStartListener(() =>
    dispatch(projectActions.setProjectUpdatedSaving()),
  );
  projectManager.addSaveSuccessListener(channel => {
    dispatch(projectActions.setProjectUpdatedAt(channel.updatedAt));
    dispatch(setChannel(channel));
    // If we had a successful save, we know the project is not too large.
    dispatch(setProjectTooLarge(false));
  });
  projectManager.addSaveNoopListener(channel => {
    if (channel) {
      dispatch(projectActions.setProjectUpdatedAt(channel.updatedAt));
      dispatch(setChannel(channel));
    } else {
      dispatch(projectActions.setProjectUpdatedSaved());
    }
  });
  projectManager.addSaveFailListener(error => {
    dispatch(projectActions.setProjectUpdatedError());
    if (error.message?.includes('413')) {
      // The user's project is too large to save. Mark it as too large.
      dispatch(setProjectTooLarge(true));
    }
  });
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
  return await projectManager.load(appName, resetToStartSources);
}

// If any load is currently in progress.
export const isLabLoading = (state: {lab: LabState}) =>
  state.lab.isLoadingProjectOrLevel ||
  state.lab.isLoading ||
  state.lab.isLoadingTheme;

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

// This may depend on more factors, such as share.
export const isReadOnlyWorkspace = (state: RootState) => {
  const isEditMode = !!getAppOptionsEditBlocks();
  const isEditingExemplar = getAppOptionsEditingExemplar();
  const isViewingExemplar = getAppOptionsViewingExemplar();
  const isWidgetView = !!state.lab.levelProperties?.widgetView;

  // Exemplar and block edit modes do not have a channel.
  if (isEditMode || isEditingExemplar) {
    return false;
  } else if (isViewingExemplar) {
    return true;
  }
  // Otherwise, we are in read only mode if we are not the owner of the channel,
  // the level is frozen, the level is a read only predict level, the level has been submitted.
  // or this is a lab that should be read only while running and the code is currently running.
  const isOwner = state.lab.channel?.isOwner;
  const isFrozen = !!state.lab.channel?.frozen;
  const readonlyPredictLevel = isReadonlyPredictLevel(state);
  const hasSubmitted =
    progressActions.getCurrentLevel(state)?.status === LevelStatus.submitted;
  const isViewingOldVersion = state.labProject.viewingOldVersion;
  const isRunningAndReadonly =
    (state.labSystem.isRunning || state.labSystem.isValidating) &&
    shouldBeReadonlyWhileRunning(state);

  return (
    !isOwner ||
    isFrozen ||
    readonlyPredictLevel ||
    hasSubmitted ||
    isRunningAndReadonly ||
    isViewingOldVersion ||
    isWidgetView
  );
};

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
    abuseScore?: number;
    sharingDisabled?: boolean;
  },
  aborted: boolean,
  dispatch: AppDispatch,
  getState: () => RootState,
) {
  // Only set channel and sources if the request has not been cancelled.
  if (aborted) {
    return;
  }
  // Dispatch level change last so labs can react to the new level data
  // and new initial sources at once.
  dispatch(onLevelChange(data));
  LabRegistry.lifecycleNotifier.notify(
    LifecycleEvent.LevelLoadCompleted,
    data.levelProperties,
    data.channel,
    data.initialSources,
    data.abuseScore,
    isReadOnlyWorkspace(getState()),
    data.sharingDisabled,
  );
}

async function loadLevelProperties(
  levelPropertiesPath: string,
): Promise<LevelProperties> {
  const response = await HttpClient.fetchJson<LevelProperties>(
    levelPropertiesPath,
    {},
    LevelPropertiesValidator,
  );
  return response.value;
}

async function loadUserAppOptions(
  userAppOptionsPath: string,
): Promise<PartialUserAppOptions> {
  const response =
    await HttpClient.fetchJson<PartialUserAppOptions>(userAppOptionsPath);
  return response.value;
}

async function cleanUpProjectManager() {
  // Check for an existing project manager and clean it up, if it exists.
  const existingProjectManager = LabRegistry.projectManager;
  // Save any unsaved code and clear out any remaining enqueued
  // saves from the existing project manager.
  await existingProjectManager?.cleanUp();
  LabRegistry.projectManager = undefined;
}

// This is an action that other reducers (specifically predictLevelRedux) can respond to.
export const setLoadedPredictResponse = createAction<string>(
  'lab/setLoadedPredictResponse',
);

export const {
  setIsLoading,
  setIsLoadingTheme,
  setPageError,
  clearPageError,
  setValidationState,
  setIsShareView,
  setOverrideValidations,
  setScriptId,
  onLevelChange,
  setPermissions,
  setChannel,
} = slice.actions;
export default slice;
