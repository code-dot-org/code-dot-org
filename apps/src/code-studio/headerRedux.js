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
  projectName: ''
};

export default (state = initialState, action) => {
  if (action.type === SHOW_PROJECT_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.project
    };
  } else if (action.type === SHOW_MINIMAL_PROJECT_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.minimalProject
    };
  } else if (action.type === SHOW_PROJECT_BACKED_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.projectBacked
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

  return state;
};

export const showProjectHeader = () => ({
  type: SHOW_PROJECT_HEADER
});

export const showMinimalProjectHeader = () => ({
  type: SHOW_MINIMAL_PROJECT_HEADER
});

export const showProjectBackedHeader = () => ({
  type: SHOW_PROJECT_BACKED_HEADER
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
