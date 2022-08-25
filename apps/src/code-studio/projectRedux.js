/** Redux actions and reducer for an individual project */
/* globals dashboard */

const SHOW_PROJECT_UPDATED_AT = 'project/SHOW_PROJECT_UPDATED_AT';
const SET_PROJECT_UPDATED_STATUS = 'project/SET_PROJECT_UPDATED_STATUS';
const SET_PROJECT_UPDATED_AT = 'project/SET_PROJECT_UPDATED_AT';
const SET_WORKSPACE_ALERT = 'project/SET_WORKSPACE_ALERT';
const REFRESH_PROJECT_NAME = 'project/REFRESH_PROJECT_NAME';
const SHOW_TRY_AGAIN_DIALOG = 'project/SHOW_TRY_AGAIN_DIALOG';
const SET_NAME_FAILURE = 'project/SET_NAME_FAILURE';
const UNSET_NAME_FAILURE = 'project/UNSET_NAME_FAILURE';

export const projectUpdatedStatuses = {
  default: 'default',
  saving: 'saving',
  saved: 'saved',
  error: 'error'
};

const initialState = {
  showProjectUpdatedAt: false,
  projectUpdatedStatus: projectUpdatedStatuses.default,
  projectUpdatedAt: undefined,
  projectName: '',
  projectNameFailure: undefined,
  showTryAgainDialog: false,
  displayWorkspaceAlert: false,
  errorMsg: ''
};

export default (state = initialState, action) => {
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

  if (action.type === SET_WORKSPACE_ALERT) {
    return {
      ...state,
      errorMsg: action.errorMsg,
      displayWorkspaceAlert: action.displayWorkspaceAlert
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

  if (action.type === UNSET_NAME_FAILURE) {
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

export const showProjectUpdatedAt = () => ({
  type: SHOW_PROJECT_UPDATED_AT
});

export const setProjectUpdatedError = () => ({
  type: SET_PROJECT_UPDATED_STATUS,
  status: projectUpdatedStatuses.error
});

export const displayWorkspaceAlertOn = errorMsg => ({
  type: SET_WORKSPACE_ALERT,
  displayWorkspaceAlert: true,
  errorMsg
});

export const displayWorkspaceAlertOff = () => ({
  type: SET_WORKSPACE_ALERT,
  displayWorkspaceAlert: false,
  errorMsg: ''
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

export const retryProjectSave = () => {
  return dispatch => dashboard.project.save();
};

export const refreshProjectName = () => ({
  type: REFRESH_PROJECT_NAME
});

export const setShowTryAgainDialog = visible => ({
  type: SHOW_TRY_AGAIN_DIALOG,
  visible
});

export const setNameFailure = projectNameFailure => ({
  type: SET_NAME_FAILURE,
  projectNameFailure
});

export const unsetNameFailure = () => ({
  type: UNSET_NAME_FAILURE
});
