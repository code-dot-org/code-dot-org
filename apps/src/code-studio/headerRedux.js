/* globals dashboard */

const SHOW_PROJECT_HEADER = 'header/SHOW_PROJECT_HEADER';
const SHOW_MINIMAL_PROJECT_HEADER = 'header/SHOW_MINIMAL_PROJECT_HEADER';
const SHOW_PROJECT_BACKED_HEADER = 'header/SHOW_PROJECT_BACKED_HEADER';
const SHOW_PROJECT_UPDATED_AT = 'header/SHOW_PROJECT_UPDATED_AT';
const SET_PROJECT_UPDATED_AT = 'header/SET_PROJECT_UPDATED_AT';
const ENABLE_LEVEL_BUILDER_SAVE_BUTTON =
  'header/ENABLE_LEVEL_BUILDER_SAVE_BUTTON';
const REFRESH_PROJECT_NAME = 'header/REFRESH_PROJECT_NAME';

const initialState = {
  showProjectHeader: false,
  showMinimalProjectHeader: false,
  showProjectBackedHeader: false,
  showProjectUpdatedAt: false,
  projectUpdatedAt: undefined,
  showLevelBuilderSaveButton: false,
  getLevelBuilderChanges: undefined,
  projectName: dashboard.project.getCurrentName()
};

export default (state = initialState, action) => {
  // TODO: are the various kinds of headers mutually exclusive?
  if (action.type === SHOW_PROJECT_HEADER) {
    return {
      ...state,
      showProjectHeader: true
    };
  }

  if (action.type === SHOW_MINIMAL_PROJECT_HEADER) {
    return {
      ...state,
      showMinimalProjectHeader: true
    };
  }

  if (action.type === SHOW_PROJECT_BACKED_HEADER) {
    return {
      ...state,
      showProjectBackedHeader: true
    };
  }

  if (action.type === ENABLE_LEVEL_BUILDER_SAVE_BUTTON && action.getChanges) {
    return {
      ...state,
      showLevelBuilderSaveButton: true,
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
      projectUpdatedAt: action.updatedAt
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

export const setProjectUpdatedAt = updatedAt => ({
  type: SET_PROJECT_UPDATED_AT,
  updatedAt
});

export const refreshProjectName = () => ({
  type: REFRESH_PROJECT_NAME
});
