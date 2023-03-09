/** Redux actions and reducer for an individual project */
/* globals dashboard */

const SHOW_PROJECT_UPDATED_AT = 'project/SHOW_PROJECT_UPDATED_AT';
const SET_PROJECT_UPDATED_STATUS = 'project/SET_PROJECT_UPDATED_STATUS';
const SET_PROJECT_UPDATED_AT = 'project/SET_PROJECT_UPDATED_AT';
const SHOW_WORKSPACE_ALERT = 'project/SHOW_WORKSPACE_ALERT';
const REFRESH_PROJECT_NAME = 'project/REFRESH_PROJECT_NAME';
const SHOW_TRY_AGAIN_DIALOG = 'project/SHOW_TRY_AGAIN_DIALOG';
const SET_NAME_FAILURE = 'project/SET_NAME_FAILURE';
const UNSET_NAME_FAILURE = 'project/UNSET_NAME_FAILURE';
const REFRESH_IN_RESTRICTED_SHARE_MODE =
  'project/REFRESH_IN_RESTRICTED_SHARE_MODE';

export const projectUpdatedStatuses = {
  default: 'default',
  saving: 'saving',
  saved: 'saved',
  error: 'error'
};

export const workspaceAlertTypes = {
  error: 'error',
  warning: 'warning',
  notification: 'notification'
};

const initialState = {
  showProjectUpdatedAt: false,
  projectUpdatedStatus: projectUpdatedStatuses.default,
  projectUpdatedAt: undefined,
  projectName: '',
  projectNameFailure: undefined,
  showTryAgainDialog: false,
  showWorkspaceAlert: {type: '', message: '', displayBottom: undefined},
  inRestrictedShareMode: false
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

  if (action.type === SHOW_WORKSPACE_ALERT) {
    return {
      ...state,
      workspaceAlert: action.workspaceAlert
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
  if (action.type === REFRESH_IN_RESTRICTED_SHARE_MODE) {
    return {
      ...state,
      inRestrictedShareMode: dashboard.project.inRestrictedShareMode()
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

export const displayWorkspaceAlert = (
  workspaceAlertType,
  workspaceAlertMessage,
  workspaceAlertDisplayBottom
) => ({
  type: SHOW_WORKSPACE_ALERT,
  workspaceAlert: {
    type: workspaceAlertType,
    message: workspaceAlertMessage,
    displayBottom: workspaceAlertDisplayBottom
  }
});

export const closeWorkspaceAlert = () => ({
  type: SHOW_WORKSPACE_ALERT,
  workspaceAlert: null
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

export function refreshInRestrictedShareMode() {
  return {
    type: REFRESH_IN_RESTRICTED_SHARE_MODE
  };
}
