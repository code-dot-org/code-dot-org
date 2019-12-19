/* globals dashboard */

const SHOW_PROJECT_HEADER = 'header/SHOW_PROJECT_HEADER';
const SHOW_MINIMAL_PROJECT_HEADER = 'header/SHOW_MINIMAL_PROJECT_HEADER';
const SHOW_PROJECT_BACKED_HEADER = 'header/SHOW_PROJECT_BACKED_HEADER';
const SHOW_PROJECT_UPDATED_AT = 'header/SHOW_PROJECT_UPDATED_AT';
const SET_PROJECT_UPDATED_STATUS = 'header/SET_PROJECT_UPDATED_STATUS';
const SET_PROJECT_UPDATED_AT = 'header/SET_PROJECT_UPDATED_AT';
const ENABLE_LEVEL_BUILDER_SAVE_BUTTON =
  'header/ENABLE_LEVEL_BUILDER_SAVE_BUTTON';
const REFRESH_PROJECT_NAME = 'header/REFRESH_PROJECT_NAME';
const SHOW_TRY_AGAIN_DIALOG = 'header/SHOW_TRY_AGAIN_DIALOG';
const SET_NAME_FAILURE = 'header/SET_NAME_FAILURE';
const RESET_NAME_FAILURE = 'header/RESET_NAME_FAILURE';

export const projectUpdatedStatuses = {
  default: 'default',
  saving: 'saving',
  saved: 'saved',
  error: 'error'
};

export const possibleHeaders = {
  project: 'project',
  minimalProject: 'minimalProject',
  projectBacked: 'projectBacked',
  levelBuilderSave: 'levelBuilderSave'
};

const initialState = {
  currentHeader: undefined,
  showProjectUpdatedAt: false,
  projectUpdatedStatus: projectUpdatedStatuses.default,
  projectUpdatedAt: undefined,
  getLevelBuilderChanges: undefined,
  projectName: '',
  projectNameFailure: undefined,
  includeExportInProjectHeader: false,
  showTryAgainDialog: false
};

export default (state = initialState, action) => {
  if (action.type === SHOW_PROJECT_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.project,
      includeExportInProjectHeader: action.showExport
    };
  } else if (action.type === SHOW_MINIMAL_PROJECT_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.minimalProject
    };
  } else if (action.type === SHOW_PROJECT_BACKED_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.projectBacked,
      includeExportInProjectHeader: action.showExport
    };
  } else if (
    action.type === ENABLE_LEVEL_BUILDER_SAVE_BUTTON &&
    action.getChanges
  ) {
    return {
      ...state,
      currentHeader: possibleHeaders.levelBuilderSave,
      getLevelBuilderChanges: action.getChanges
    };
  }

  if (action.type === SHOW_PROJECT_UPDATED_AT) {
    return {
      ...state,
      showProjectUpdatedAt: true
    };
  }

  if (action.type === SET_PROJECT_UPDATED_AT) {
    return {
      ...state,
      projectUpdatedAt: action.updatedAt,
      projectUpdatedStatus: projectUpdatedStatuses.saved
    };
  }

  if (action.type === SET_PROJECT_UPDATED_STATUS) {
    return {
      ...state,
      projectUpdatedStatus: action.status
    };
  }

  if (action.type === REFRESH_PROJECT_NAME) {
    return {
      ...state,
      projectName: dashboard.project.getCurrentName()
    };
  }

  if (action.type === SHOW_TRY_AGAIN_DIALOG) {
    return {
      ...state,
      showTryAgainDialog: action.visible
    };
  }

  if (action.type === RESET_NAME_FAILURE) {
    return {
      ...state,
      projectNameFailure: undefined
    };
  }

  if (action.type === SET_NAME_FAILURE) {
    return {
      ...state,
      projectNameFailure: action.projectNameFailure
    };
  }

  return state;
};

export const showProjectHeader = showExport => ({
  type: SHOW_PROJECT_HEADER,
  showExport
});

export const showMinimalProjectHeader = () => ({
  type: SHOW_MINIMAL_PROJECT_HEADER
});

export const showProjectBackedHeader = showExport => ({
  type: SHOW_PROJECT_BACKED_HEADER,
  showExport
});

export const showLevelBuilderSaveButton = getChanges => ({
  type: ENABLE_LEVEL_BUILDER_SAVE_BUTTON,
  getChanges
});

export const showProjectUpdatedAt = () => ({
  type: SHOW_PROJECT_UPDATED_AT
});

export const setProjectUpdatedError = () => ({
  type: SET_PROJECT_UPDATED_STATUS,
  status: projectUpdatedStatuses.error
});

export const setProjectUpdatedSaving = () => ({
  type: SET_PROJECT_UPDATED_STATUS,
  status: projectUpdatedStatuses.saving
});

export const setProjectUpdatedSaved = () => ({
  type: SET_PROJECT_UPDATED_STATUS,
  status: projectUpdatedStatuses.saved
});

export const setProjectUpdatedAt = updatedAt => ({
  type: SET_PROJECT_UPDATED_AT,
  updatedAt
});

export const refreshProjectName = () => ({
  type: REFRESH_PROJECT_NAME
});

export const setShowTryAgainDialog = visible => ({
  type: SHOW_TRY_AGAIN_DIALOG,
  visible
});

export const retryProjectSave = () => {
  return dispatch => dashboard.project.save();
};

export const setNameFailure = projectNameFailure => ({
  type: SET_NAME_FAILURE,
  projectNameFailure
});

export const resetNameFailure = () => ({
  type: RESET_NAME_FAILURE
});
