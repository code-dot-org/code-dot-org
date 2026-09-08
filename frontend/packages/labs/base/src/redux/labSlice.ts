import {createSlice, createAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {PayloadAction, AnyAction, Slice} from '@reduxjs/toolkit';

import type {
  ApiClient,
  AppOptions,
  Channel,
  LevelProperties,
  ProjectSources,
  QueryClient,
  UserAppOptions,
} from '@code-dot-org/core/api';
import {
  ApiError,
  levelsKeys,
  OPEN_ENDED_LAB2_PROJECT_TYPES,
} from '@code-dot-org/core/api';
import type {Validation, ValidationState} from '@code-dot-org/progress';
import {
  getInitialValidationState,
  LevelStatuses,
  progressActions,
} from '@code-dot-org/progress';
import {
  projectActions,
  ProjectManagerFactory,
  ProjectManager,
} from '../projects';
import {CourseRoles, currentUserActions} from '@code-dot-org/users';

import LabRegistry from '../LabRegistry';
import {LifecycleEvent} from '../LifecycleNotifier';
import type {RootState, AppDispatch} from '../redux/store';
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
  /**
   * The level whose project data has arrived, or undefined before any has.
   *
   * A POSITIVE signal, because the absence of a load in flight is not the same
   * as a load having happened: `isLoadingProjectOrLevel` is false both before
   * `loadLab` is dispatched (it goes out from an effect, a render after the
   * level metadata lands) and after it settles. A host that waits on the flag
   * alone still gets one render with no sources — long enough to show a lab
   * seeded from the level's start sources and then swap it for the learner's
   * project, which is the flicker this exists to prevent.
   */
  loadedLevelId: number | undefined;
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
  // AppOptions block
  appOptions: AppOptions | undefined;
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
  loadedLevelId: undefined,
  isLoading: false,
  isLoadingTheme: false,
  pageError: undefined,
  channel: undefined,
  initialSources: undefined,
  validationState: getInitialValidationState(),
  levelProperties: undefined,
  appOptions: undefined,
  scriptId: undefined,
  isShareView: undefined,
  isBlockedAbuse: undefined,
  projectSharingDisabled: undefined,
  overrideValidations: undefined,
  permissions: [],
};

// Standalone action so its type stays a clean `ActionCreatorWithoutPayload`.
// (createSlice degrades this slice's generated action-creator types to a union
// that is not callable with zero arguments; a standalone createAction avoids
// that, matching `setLoadedPredictResponse` below.) Handled in extraReducers.
export const clearPageError = createAction('lab/clearPageError');

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
        appOptions: AppOptions;
        levelProperties: LevelProperties;
        initialSources?: ProjectSources;
        abuseScore?: number;
        sharingDisabled?: boolean;
      }>,
    ) {
      const {levelProperties, appOptions} = action.payload;
      // Everything a lab needs to render correctly is in this action, including
      // a level that has no project at all (`usesProjects` false, edit modes,
      // exemplars — they reach here too, with no sources, which is the right
      // answer for them).
      state.loadedLevelId = levelProperties.id;
      state.channel = action.payload.channel;
      // Cast needed because LevelProperties contains readonly nested types (BlockOptionsList)
      // that conflict with Immer's WritableDraft requirements
      state.levelProperties = levelProperties as typeof state.levelProperties;
      state.appOptions = appOptions;
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
    builder.addCase(loadLab.fulfilled, state => {
      state.isLoadingProjectOrLevel = false;
    });
    builder.addCase(loadLab.rejected, (state, action) => {
      // If the set up was aborted, that means another load got started
      // before we finished. Therefore we only set loading to false if the
      // action was not aborted.
      if (!action.meta.aborted) {
        state.isLoadingProjectOrLevel = false;
        state.pageError = getErrorFromThunkAction(action, 'loadLab failed');
      }
    });
    builder.addCase(loadLab.pending, state => {
      state.isLoadingProjectOrLevel = true;
      // Switching levels does not reload the page (Lab2), so what was loaded
      // before is not what is being asked for now.
      state.loadedLevelId = undefined;
    });
    builder.addCase(clearPageError, state => {
      state.pageError = undefined;
    });
  },
});

// Thunks

/**
 * Host-facing input for {@link loadLab}.
 *
 * These are the *post-resolution* inputs. The studio host fetches level
 * properties and app options itself (see `useLevelProperties` /
 * `useAppOptions` in `@code-dot-org/core/api`) and dispatches `loadLab` with
 * the resolved values. Fields that the package used to read from
 * `state.progress` during the load path are now supplied explicitly by the
 * host, severing the package's coupling to the progress slice for loading.
 *
 * Note the level-properties fetch concerns (`scriptName`, `lessonPosition`,
 * `standaloneProjectType`) are deliberately absent: they parameterize the
 * host's LP/AO fetch, not this thunk. Standalone projects carry no level id of
 * their own, so the host pre-resolves `levelId` to the first key of the
 * level-properties map before dispatching — matching what the package did
 * internally before.
 */
export interface LoadLabInput {
  /** API client — already host-injected via context. */
  apiClient: ApiClient;
  /** Query client — already host-injected via context. */
  queryClient: QueryClient;
  /** Resolved level properties for the current level (host-fetched). */
  levelProperties: LevelProperties;
  /** Resolved app options for the current level (host-fetched). */
  appOptions: AppOptions;
  /** Optional user app options (instructor flag for cached levels). */
  userAppOptions?: UserAppOptions;
  /** Current level id; pre-resolved by the host for standalone projects. (was `state.progress.currentLevelId`) */
  levelId: number;
  /** Script id, when the level is part of a unit. (was `state.progress.scriptId`) */
  scriptId?: number;
  /** User app options path, when in a script level. (was `progressActions.getUserAppOptionsPath`) */
  userAppOptionsPath?: string;
  /** Channel id for standalone projects / projects without levels. */
  channelId?: string;
  /** User being viewed, e.g. a teacher viewing a student. (was `state.progress.viewAsUserId`) */
  userId?: number;
}

// Set up the lab properties and project manager for the given level (and optional script),
// then load the project and store the channel and source in redux.
// If we are given a channel id, we will use that to load the project, otherwise we will
// get the channel id based on the level and script id.
// If we get an aborted signal, we will exit early.
export const loadLab = createAsyncThunk<
  void,
  LoadLabInput,
  {dispatch: AppDispatch; state: RootState}
>('lab/loadLab', async (payload, thunkAPI) => {
  LabRegistry.lifecycleNotifier.notify(
    LifecycleEvent.LevelLoadStarted,
    payload.levelId,
  );
  try {
    // Update standalone channel ID early if we have one.
    if (payload.channelId) {
      LabRegistry.metricsReporter.updateProperties({
        channelId: payload.channelId,
      });
    }

    const {levelProperties, appOptions} = payload;

    await cleanUpProjectManager();
    const isViewingExemplar = appOptions.isViewingExemplar;
    const isEditingExemplar = appOptions.isEditingExemplar;

    thunkAPI.dispatch(setScriptId(payload.scriptId));

    // If we are cached, and there is a user app options path because we are in a script
    // level, then make an async call to the server to find out whether the user is an
    // instructor, and if they are, then update the user role.  This is needed for the
    // teacher panel to appear in cached levels.
    if (appOptions.publicCaching) {
      if (payload.userAppOptions?.isInstructor) {
        thunkAPI.dispatch(
          currentUserActions.setUserRoleInCourse(CourseRoles.Instructor),
        );
      }
    }

    if (!levelProperties.usesProjects) {
      // If projects are disabled on this level, we can skip loading projects data.
      setProjectAndLevelData(
        {levelProperties, appOptions},
        thunkAPI.signal.aborted,
        thunkAPI.dispatch,
        thunkAPI.getState,
      );
      return;
    }

    // If we are in a block edit mode or are editing or viewing exemplars,
    // we don't use a channel id.
    // We can skip creating a project manager and just set the level data.
    const isEditMode = !!appOptions.editBlocks;
    if (isEditMode || isViewingExemplar || isEditingExemplar) {
      setProjectAndLevelData(
        {levelProperties, appOptions},
        thunkAPI.signal.aborted,
        thunkAPI.dispatch,
        thunkAPI.getState,
      );
      return;
    }

    const {apiClient, queryClient} = payload;

    // If we have a predict level, we should try to load the existing response.
    // We only can load predict responses if we have a script id.
    if (levelProperties.predictSettings?.isPredictLevel && payload.scriptId) {
      const {levelId, scriptId} = payload;
      const predictResponse = await queryClient.fetchQuery({
        queryKey: levelsKeys.predictResponse(scriptId, levelId),
        queryFn: () => apiClient.levels.getPredictResponse({levelId, scriptId}),
      });
      thunkAPI.dispatch(setLoadedPredictResponse(predictResponse));
    } else {
      // If this isn't a predict level, reset the response to an empty string
      // to avoid potentially confusing behavior.
      thunkAPI.dispatch(setLoadedPredictResponse(''));
    }

    // Create a new project manager. If we have a channel id,
    // default to loading the project for that channel. Otherwise
    // create a project manager for the given level and script id.
    const projectManager = payload.channelId
      ? ProjectManagerFactory.getProjectManager(
          apiClient,
          queryClient,
          payload.channelId,
          levelProperties.isProjectLevel || false,
          thunkAPI.getState().lab.isShareView,
          LabRegistry.metricsReporter,
        )
      : await ProjectManagerFactory.getProjectManagerForLevel(
          payload.apiClient,
          payload.queryClient,
          payload.levelId,
          levelProperties.isProjectLevel || false,
          payload.userId,
          payload.scriptId,
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
        {levelProperties, appOptions},
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
    const {
      sources,
      channel,
      abuseScore,
      sharingDisabled,
      isTeacherOfProjectOwner,
    } = await setUpAndLoadProject(projectManager, thunkAPI.dispatch);
    setProjectAndLevelData(
      {
        initialSources: sources,
        channel,
        levelProperties,
        appOptions,
        abuseScore,
        sharingDisabled,
        isTeacherOfProjectOwner,
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
    if (payloadError instanceof ApiError) {
      networkError = payloadError;
    } else if (payloadError.cause && payloadError.cause instanceof ApiError) {
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
  return await projectManager.load(resetToStartSources);
}

/**
 * Whether this level's project data has arrived.
 *
 * What a host should gate rendering on: a lab that mounts before this is true
 * is a lab seeded from the level's start sources, which will be replaced the
 * moment the project lands. An honest spinner beats showing the wrong project.
 */
export const hasLoadedProjectFor =
  (levelId: number | undefined) => (state: RootState) =>
    levelId !== undefined && state.lab.loadedLevelId === levelId;

// If any load is currently in progress.
export const isLabLoading = (state: RootState) =>
  state.lab.isLoadingProjectOrLevel ||
  state.lab.isLoading ||
  state.lab.isLoadingTheme;

// If there is an error present on the page.
export const hasPageError = (state: RootState) => {
  return state.lab.pageError !== undefined;
};

// If the share and remix buttons should be hidden for the lab. Defaults to true (hidden)
// if not specified.
export const shouldHideShareAndRemix = (state: RootState): boolean => {
  const hideShareAndRemix = state.lab.levelProperties?.hideShareAndRemix;
  return hideShareAndRemix === undefined ? true : hideShareAndRemix;
};

export const isProjectTemplateLevel = (state: RootState) =>
  !!state.lab.levelProperties?.projectTemplateLevelName;

// Returns if the current state represents a predict level that should be read only.
// If the predict level code is not editable after submit or the user has not submitted a response,
// the predict level is read only.
export function isReadOnlyPredictLevel(state: RootState) {
  const isPredictLevel =
    state.lab.levelProperties?.predictSettings?.isPredictLevel || false;
  let isReadOnlyPredictLevel = isPredictLevel;
  if (isPredictLevel) {
    const isEditableAfterSubmit =
      state.lab.levelProperties?.predictSettings?.codeEditableAfterSubmit ||
      false;
    const hasSubmittedPredictResponse = state.predictLevel.hasSubmittedResponse;
    // If the predict level code is not editable after submit or the user has not submitted a response,
    // the predict level is read only.
    isReadOnlyPredictLevel =
      !isEditableAfterSubmit || !hasSubmittedPredictResponse;
  }
  return isReadOnlyPredictLevel;
}

// Currently only Python Lab disables editing while code is running.
function shouldBeReadonlyWhileRunning(state: RootState) {
  return state.lab.levelProperties?.appName === 'pythonlab';
}

// Returns true if the workspace is permanently read-only.
// This excludes temporary read-only states such as running/validating.
export const isPermanentlyReadOnlyWorkspace = (state: RootState) => {
  const isEditMode = !!state.lab.appOptions?.editBlocks;
  const isEditingExemplar = !!state.lab.appOptions?.isEditingExemplar;
  const isViewingExemplar = !!state.lab.appOptions?.isViewingExemplar;
  const isWidgetView = !!state.lab.levelProperties?.widgetView;

  // Exemplar and block edit modes do not have a channel.
  if (isEditMode || isEditingExemplar) {
    return false;
  } else if (isViewingExemplar) {
    return true;
  }
  // Otherwise, we are in permanently read-only mode if we are not the owner of the channel,
  // the level is frozen, or in widget view.
  const isOwner = state.lab.channel?.isOwner;
  const isFrozen = !!state.lab.channel?.frozen;

  return !isOwner || isFrozen || isWidgetView;
};

// This may depend on more factors, such as share.
export const isReadOnlyWorkspace = (state: RootState) => {
  const isEditMode = !!state.lab.appOptions?.editBlocks;
  const isEditingExemplar = !!state.lab.appOptions?.isEditingExemplar;
  const isViewingExemplar = !!state.lab.appOptions?.isViewingExemplar;
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
  const readonlyPredictLevel = isReadOnlyPredictLevel(state);
  const hasSubmitted =
    progressActions.getCurrentLevel(state)?.status === LevelStatuses.Submitted;
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
    appOptions: AppOptions;
    channel?: Channel;
    initialSources?: ProjectSources;
    abuseScore?: number;
    sharingDisabled?: boolean;
    isTeacherOfProjectOwner?: boolean;
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
    data.isTeacherOfProjectOwner,
  );
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
  setValidationState,
  setIsShareView,
  setOverrideValidations,
  setScriptId,
  onLevelChange,
  setPermissions,
  setChannel,
} = slice.actions;
export default slice;
