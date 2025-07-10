// Store the project source in the redux store and tell the project manager

import {ThunkAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AnyAction} from 'redux';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  ProjectSources,
  MultiFileSource,
  FolderId,
  FileId,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  setSource,
  setPreviousVersionSource,
  setProjectSource,
  setViewingOldVersion,
  createNewFile,
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
} from './lab2ProjectRedux';
import {isReadOnlyWorkspace} from './lab2ReduxSelectors';

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

export const createNewFileThunk = (
  fileName: string,
  folderId?: FolderId,
  contents?: string,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(createNewFile({fileName, folderId, contents}));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const renameFileThunk = (
  fileId: FileId,
  newName: string,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(renameFile({fileId, newName}));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const saveFileThunk = (
  fileId: FileId,
  contents: string,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(saveFile({fileId, contents}));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const setFileTypeThunk = (
  fileId: FileId,
  type: ProjectFileType,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(setFileType({fileId, type}));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const deleteFileThunk = (
  fileId: FileId,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(deleteFile(fileId));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const moveFileThunk = (
  fileId: FileId,
  folderId: FolderId,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(moveFile({fileId, folderId}));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const moveFolderThunk = (
  folderId: FolderId,
  parentId: FolderId,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(moveFolder({folderId, parentId}));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const createNewFolderThunk = (
  folderName: string,
  parentId?: string,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(createNewFolder({folderName, parentId}));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const deleteFolderThunk = (
  folderId: FolderId,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(deleteFolder(folderId));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

export const renameFolderThunk = (
  folderId: FolderId,
  newName: string,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(renameFolder({folderId, newName}));
    saveProjectIfEditable(getState, forceSave, forceNewVersion);
  };
};

function saveProjectIfEditable(
  getState: () => RootState,
  forceSave: boolean = false,
  forceNewVersion: boolean = false
) {
  const projectSources = getState().lab2Project.projectSources;
  const isReadOnly = isReadOnlyWorkspace(getState());
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
