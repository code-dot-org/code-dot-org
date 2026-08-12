import {
  type PayloadAction,
  type ThunkAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import type {AnyAction} from 'redux';

import type {
  LabConfig,
  MultiFileSource,
  ProjectSources,
  ProjectVersion,
} from '@code-dot-org/core/api';

import LabRegistry from '../LabRegistry';
import type {AppDispatch, RootState} from '../redux/store';

export interface LabProjectState {
  projectSources?: ProjectSources;
  projectSourceBeforeAiTutorVersion?: MultiFileSource;
  versionDetails?: ProjectVersion;
  viewingOldVersion: boolean;
  viewingAiTutorVersion?: boolean;
  restoredOldVersion: boolean;
  hasEdited: boolean;
  projectTooLarge: boolean;
  lastSavedLabConfig?: LabConfig;
  projectSourceLevelId?: number;
}

const initialState: LabProjectState = {
  viewingOldVersion: false,
  viewingAiTutorVersion: false,
  restoredOldVersion: false,
  hasEdited: false,
  projectTooLarge: false,
};

// THUNKS

// Store the project source in the redux store and tell the project manager
// to save it.
//
// AWAITS THE SAVE, and hands the promise back, so `await dispatch(…)` means
// what it says. It used to start the save and return, which made two things
// wrong for every caller that awaited it — and both of them looked like bugs
// somewhere else:
//
//   naming a version   `SaveVersionPanel` awaits this, then reads
//                      `getCurrentVersionId()` to say which version the name
//                      belongs to. Un-awaited, that id is still the PREVIOUS
//                      one, so the comment landed on the version before the one
//                      just written — and the first named save of a session,
//                      where there is no previous version, lost its name.
//   the list after it  the same panel then reloads the version list, which is
//                      served from the query cache and invalidated by the save.
//                      Un-awaited, the reload overtook the invalidation and the
//                      panel redrew the list as it was BEFORE the save.
export const setAndSaveProjectSources = (
  projectSources: ProjectSources,
  forceSave: boolean = false,
  forceNewVersion: boolean = false,
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> => {
  return async dispatch => {
    dispatch(projectSlice.actions.setProjectSource(projectSources));
    dispatch(
      projectSlice.actions.setLastSavedLabConfig(projectSources.labConfig),
    );
    if (LabRegistry.projectManager) {
      await LabRegistry.projectManager.save(
        projectSources,
        forceSave,
        forceNewVersion,
      );
    }
  };
};

export const setAndSaveSource = (
  source: MultiFileSource,
  forceSave: boolean = false,
  forceNewVersion: boolean = false,
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(setSource(source));
    const projectSources = getState().labProject.projectSources;
    if (LabRegistry.projectManager && projectSources) {
      LabRegistry.projectManager?.save(
        projectSources,
        forceSave,
        forceNewVersion,
      );
    }
  };
};

export const loadVersion = createAsyncThunk(
  'labProject/loadVersion',
  async (
    payload: {
      startSources: ProjectSources;
      version?: ProjectVersion;
      onLoadVersion?: (sources: ProjectSources) => void;
    },
    thunkAPI,
  ) => {
    const projectManager = LabRegistry.projectManager;
    if (projectManager) {
      // We need to ensure we save the existing project before loading a new one.
      await projectManager.flushSave();
      // Fall back to start source if we can't load the version.
      const sources =
        (await projectManager.loadSources(payload.version?.versionId)) ||
        payload.startSources;
      thunkAPI.dispatch(
        setPreviousVersionSource({
          sources,
          version: payload.version,
        }),
      );
      if (payload.onLoadVersion) payload.onLoadVersion(sources);
    }
  },
);

export const previewStartSources = createAsyncThunk(
  'labProject/previewStartSources',
  async (
    payload: {
      startSources: ProjectSources;
      onLoadVersion?: (sources: ProjectSources) => void;
    },
    thunkAPI,
  ) => {
    const projectManager = LabRegistry.projectManager;
    if (projectManager) {
      // We need to ensure we save the existing project before loading the start source.
      await projectManager.flushSave();
      thunkAPI.dispatch(
        setPreviousVersionSource({
          sources: payload.startSources,
        }),
      );
      if (payload.onLoadVersion) payload.onLoadVersion(payload.startSources);
    }
  },
);

export const resetToCurrentVersion = createAsyncThunk(
  'labProject/resetToActiveVersion',
  async (
    payload: {onLoadVersion?: (sources: ProjectSources) => void},
    thunkAPI,
  ) => {
    const projectManager = LabRegistry.projectManager;
    if (projectManager) {
      // NO ARGUMENT: `loadSources` takes a VERSION ID, and this used to hand it
      // `LabRegistry.appName` — so "go back to the current version" asked the
      // server for a version called "world" (or "music", or…). Two things went
      // wrong with that and neither said so:
      //
      //   the sources   a store that does not have that version answers with
      //                 whatever it does for an unknown one, and the editor
      //                 showed it. Against the mock that is the starting
      //                 project, so restoring a version put the FIXTURE on
      //                 screen while the server held the right content.
      //   the version   `SourcesStore.load` only records `currentVersionId`
      //                 when asked for the latest — i.e. when no id is passed —
      //                 so the id it tracks was left stale by the one call
      //                 whose whole job is to return to the latest.
      const sources = await projectManager.loadSources();
      thunkAPI.dispatch(setProjectSource(sources));
      thunkAPI.dispatch(setViewingOldVersion(false));
      if (sources && payload.onLoadVersion) payload.onLoadVersion(sources);
    }
  },
);

export const changeProjectType = createAsyncThunk<
  void,
  {newSources: ProjectSources},
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  'labProject/changeProjectType',
  async (payload: {newSources: ProjectSources}, thunkAPI) => {
    const projectManager = LabRegistry.projectManager;
    if (projectManager) {
      // We need to ensure we save the existing project before loading a new one.
      await projectManager.flushSave();
      thunkAPI.dispatch(
        setAndSaveProjectSources(
          payload.newSources,
          true,
          true,
        ) as unknown as AnyAction,
      );
    }
  },
);

// SLICE

const projectSlice = createSlice({
  name: 'labProject',
  initialState,
  reducers: {
    setProjectSource(state, action: PayloadAction<ProjectSources | undefined>) {
      state.projectSources = action.payload;
    },
    setSource(state, action: PayloadAction<MultiFileSource>) {
      state.projectSources = {
        ...state.projectSources,
        source: action.payload,
      };
    },
    setProjectSourceLevelId(state, action: PayloadAction<number | undefined>) {
      state.projectSourceLevelId = action.payload;
    },
    setProjectSourceBeforeAiTutorVersion(
      state,
      action: PayloadAction<MultiFileSource | undefined>,
    ) {
      state.projectSourceBeforeAiTutorVersion = action.payload;
    },
    setPreviousVersionSource(
      state,
      action: PayloadAction<{
        sources: ProjectSources | undefined;
        version?: ProjectVersion;
      }>,
    ) {
      state.projectSources = action.payload.sources;
      state.versionDetails = action.payload.version;
      state.viewingOldVersion = true;
    },
    setViewingOldVersion(state, action: PayloadAction<boolean>) {
      state.viewingOldVersion = action.payload;
      if (!action.payload) {
        state.versionDetails = undefined;
      }
    },
    setViewingAiTutorVersion(state, action: PayloadAction<boolean>) {
      state.viewingAiTutorVersion = action.payload;
    },
    setRestoredOldVersion(state, action: PayloadAction<boolean>) {
      state.restoredOldVersion = action.payload;
    },
    setHasEdited(state, action: PayloadAction<boolean>) {
      state.hasEdited = action.payload;
    },
    setProjectTooLarge(state, action: PayloadAction<boolean>) {
      state.projectTooLarge = action.payload;
    },
    resetProjectMetadata(state) {
      // Reset the state that needs to be reset manually on level change.
      // Project source is handled elsewhere.
      state.hasEdited = false;
      state.versionDetails = undefined;
      state.viewingOldVersion = false;
      state.restoredOldVersion = false;
      state.viewingAiTutorVersion = false;
    },
    setLastSavedLabConfig(state, action: PayloadAction<LabConfig | undefined>) {
      state.lastSavedLabConfig = action.payload;
    },
  },
});

export const {
  setProjectSource,
  setPreviousVersionSource,
  setViewingOldVersion,
  setRestoredOldVersion,
  resetProjectMetadata,
  setHasEdited,
  setSource,
  setProjectTooLarge,
} = projectSlice.actions;

export default projectSlice;
