import {createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";

export const workspaceAlertTypes = {
  error: 'error',
  warning: 'warning',
  notification: 'notification',
} as const;

interface WorkspaceAlert {
  type: keyof typeof workspaceAlertTypes;
  message: string;
  displayBottom: boolean | undefined;
}

export const projectUpdatedStatuses = {
  default: 'default',
  saving: 'saving',
  saved: 'saved',
  error: 'error',
} as const;

export interface ProjectState {
  showProjectUpdatedAt: boolean;
  projectUpdatedStatus: keyof typeof projectUpdatedStatuses;
  projectUpdatedAt: string | undefined;
  projectName: string;
  projectNameFailure: string | undefined;
  showTryAgainDialog: boolean;
  workspaceAlert: WorkspaceAlert | null;
  inRestrictedShareMode: boolean;
  teacherHasConfirmedUploadWarning: boolean;
}

const initialState: ProjectState = {
  showProjectUpdatedAt: false,
  projectUpdatedStatus: projectUpdatedStatuses.default,
  projectUpdatedAt: undefined,
  // This is the legacy project name. The lab2 project
  // name is part of lab2Redux, in the channel.
  projectName: '',
  projectNameFailure: undefined,
  showTryAgainDialog: false,
  workspaceAlert: null,
  inRestrictedShareMode: false,
  teacherHasConfirmedUploadWarning: false,
};

const projectReduxSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    showProjectUpdatedAt: state => {
      state.showProjectUpdatedAt = true;
    },
    setProjectUpdatedError: state => {
      state.projectUpdatedStatus = projectUpdatedStatuses.error;
    },
    displayWorkspaceAlert: {
      reducer(state, action: PayloadAction<WorkspaceAlert>) {
        state.workspaceAlert = action.payload;
      },
      prepare(
        type: keyof typeof workspaceAlertTypes,
        message: string,
        displayBottom?: boolean
      ) {
        return {payload: {type, message, displayBottom}};
      },
    },
    closeWorkspaceAlert: state => {
      state.workspaceAlert = null;
    },
    setProjectUpdatedSaving: state => {
      state.projectUpdatedStatus = projectUpdatedStatuses.saving;
    },
    setProjectUpdatedSaved: state => {
      state.projectUpdatedStatus = projectUpdatedStatuses.saved;
    },
    setProjectUpdatedAt: (state, action: PayloadAction<string>) => {
      state.projectUpdatedAt = action.payload;
      state.projectUpdatedStatus = projectUpdatedStatuses.saved;
    },
    refreshProjectName: state => {
      state.projectName = 'Current Project';
    },
    setShowTryAgainDialog: (state, action: PayloadAction<boolean>) => {
      state.showTryAgainDialog = action.payload;
    },
    setNameFailure: (state, action: PayloadAction<string>) => {
      state.projectNameFailure = action.payload;
    },
    unsetNameFailure: state => {
      state.projectNameFailure = undefined;
    },
    refreshInRestrictedShareMode: state => {
      state.inRestrictedShareMode = false;
    },
    refreshTeacherHasConfirmedUploadWarning: state => {
      state.teacherHasConfirmedUploadWarning =
        false;
    },
  },
});

export const {
  showProjectUpdatedAt,
  setProjectUpdatedError,
  displayWorkspaceAlert,
  closeWorkspaceAlert,
  setProjectUpdatedSaving,
  setProjectUpdatedSaved,
  setProjectUpdatedAt,
  refreshProjectName,
  setShowTryAgainDialog,
  setNameFailure,
  unsetNameFailure,
  refreshInRestrictedShareMode,
  refreshTeacherHasConfirmedUploadWarning,
} = projectReduxSlice.actions;

export default projectReduxSlice.reducer;
