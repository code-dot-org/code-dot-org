import {
  PayloadActionCreator,
  ThunkAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {debounce} from 'lodash';
import {AnyAction} from 'redux';

import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {TestResults} from '@cdo/apps/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectSources, MultiFileSource} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import {
  setSource,
  setPreviousVersionSource,
  setProjectSource,
  setViewingOldVersion,
  createNewFile,
  createNewExternalFile,
  renameFile,
  saveFile,
  setFileType,
  moveFile,
  moveFolder,
  createNewFolder,
  deleteFolder,
  renameFolder,
  setLastSavedLabConfig,
  deleteFile,
  rearrangeFiles,
  activateFile,
  closeFile,
  toggleOpenFolder,
} from './lab2ProjectRedux';
import {isReadOnlyWorkspace} from './lab2ReduxSelectors';

// Store the project source in the redux store and tell the project manager
// to save it.
export const setAndSaveProjectSources = (
  projectSources: ProjectSources,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return dispatch => {
    dispatch(setProjectSource(projectSources));
    dispatch(setLastSavedLabConfig(projectSources.labConfig));
    if (Lab2Registry.getInstance().getProjectManager()) {
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save(projectSources, forceSave, forceNewVersion);
    }
  };
};

// Store the source in the redux store and tell the project manager
// to save the current project.
export const setAndSaveSource = (
  source: MultiFileSource,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(setSource(source));
    const projectSources = getState().lab2Project.projectSources;
    if (Lab2Registry.getInstance().getProjectManager() && projectSources) {
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save(projectSources, forceSave, forceNewVersion);
    }
  };
};

// Load a version of the project by its ID and set the previous version source.
// If the version cannot be loaded, it will fall back to the provided start sources.
export const loadVersion = createAsyncThunk(
  'lab2Project/loadVersion',
  async (
    payload: {versionId: string; startSources: ProjectSources},
    thunkAPI
  ) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      // We need to ensure we save the existing project before loading a new one.
      await projectManager.flushSave();
      // Fall back to start source if we can't load the version.
      const sources =
        (await projectManager.loadSources(payload.versionId)) ||
        payload.startSources;
      thunkAPI.dispatch(setPreviousVersionSource(sources));
    }
  }
);

// Load the start sources for the project and set them as the previous version source.
export const previewStartSources = createAsyncThunk(
  'lab2Project/previewStartSources',
  async (payload: {startSources: ProjectSources}, thunkAPI) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      // We need to ensure we save the existing project before loading the start source.
      await projectManager.flushSave();
      thunkAPI.dispatch(setPreviousVersionSource(payload.startSources));
    }
  }
);

// Reset the project to the current version, loading the sources from the project manager.
export const resetToCurrentVersion = createAsyncThunk(
  'lab2Project/resetToActiveVersion',
  async (_, thunkAPI) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (projectManager) {
      const sources = await projectManager.loadSources();
      thunkAPI.dispatch(setProjectSource(sources));
      thunkAPI.dispatch(setViewingOldVersion(false));
    }
  }
);

// Change the project type by flushing the current save and setting new sources.
// This is used when switching between different subtypes of a project,
// such as from a console Python project to a neighborhood Python project.
export const changeProjectType = createAsyncThunk<
  void,
  {newSources: ProjectSources},
  {dispatch: AppDispatch; state: RootState}
>('lab2Project/changeProjectType', async (payload, thunkAPI) => {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  if (projectManager) {
    // We need to ensure we save the existing project before loading a new one.
    await projectManager.flushSave();
    thunkAPI.dispatch(setAndSaveProjectSources(payload.newSources, true, true));
  }
});

// FILE OPERATION THUNKS
// ---------------------
// The below thunks are used to perform various file and folder operations
// on a multi-file source, such as creating, renaming, saving, and deleting files and folders.
// After the operation, the project is saved via the project manager if we are
// not in a read-only state. We will also set the progress state if the project has been edited
// and the level was in a not_tried state.

// THUNK FACTORY FOR FILE OPERATIONS
function makeFileOperationThunk<P>(
  actionCreator: PayloadActionCreator<P, string>
): (
  payload: P,
  forceSave?: boolean,
  forceNewVersion?: boolean
) => ThunkAction<void, RootState, undefined, AnyAction> {
  return (payload: P, forceSave = false, forceNewVersion = false) =>
    (dispatch: AppDispatch, getState: () => RootState) => {
      dispatch(actionCreator(payload));
      saveProjectIfEditable(getState, dispatch, forceSave, forceNewVersion);
    };
}
// Generate all thunks in one line each
export const createNewFileThunk = makeFileOperationThunk(createNewFile);
export const createNewExternalFileThunk = makeFileOperationThunk(
  createNewExternalFile
);
export const renameFileThunk = makeFileOperationThunk(renameFile);
export const saveFileThunk = makeFileOperationThunk(saveFile);
export const setFileTypeThunk = makeFileOperationThunk(setFileType);
export const setActiveFileThunk = makeFileOperationThunk(activateFile);
export const closeFileThunk = makeFileOperationThunk(closeFile);
export const deleteFileThunk = makeFileOperationThunk(deleteFile);
export const moveFileThunk = makeFileOperationThunk(moveFile);
export const moveFolderThunk = makeFileOperationThunk(moveFolder);
export const createNewFolderThunk = makeFileOperationThunk(createNewFolder);
export const toggleOpenFolderThunk = makeFileOperationThunk(toggleOpenFolder);
export const deleteFolderThunk = makeFileOperationThunk(deleteFolder);
export const renameFolderThunk = makeFileOperationThunk(renameFolder);
export const rearrangeFilesThunk = makeFileOperationThunk(rearrangeFiles);

// Save the current project sources to the project manager if we are not in a read-only state.
// If the level status is not_tried and the project has been edited, we will also report the progress
// as started.
function saveProjectIfEditable(
  getState: () => RootState,
  dispatch: AppDispatch,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
) {
  const projectSources = getState().lab2Project.projectSources;
  const isReadOnly = isReadOnlyWorkspace(getState());
  const hasEdited = getState().lab2Project.hasEdited;
  const levelStatus = getCurrentLevel(getState())?.status;
  if (levelStatus === LevelStatus.not_tried && hasEdited) {
    const appName = Lab2Registry.getInstance().getAppName();
    if (appName) {
      debouncedStartedProgressReport(dispatch, appName);
    }
  }
  if (
    Lab2Registry.getInstance().getProjectManager() &&
    projectSources &&
    !isReadOnly
  ) {
    Lab2Registry.getInstance()
      .getProjectManager()
      ?.save(projectSources, forceSave, forceNewVersion);
  }
}

const debouncedStartedProgressReport = debounce(
  (dispatch: AppDispatch, appName: string) => {
    dispatch(sendProgressReport(appName, TestResults.LEVEL_STARTED));
  },
  100
);
