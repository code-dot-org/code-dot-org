/**
 * Redux store for generic Java Lab state.
 */

import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface JavalabState {
  isRunning: boolean;
  isTesting: boolean;
  backpackEnabled: boolean;
  isStartMode: boolean;
  levelName: string | undefined;
  isReadOnlyWorkspace: boolean;
  hasOpenCodeReview: boolean;
  isCommitSaveInProgress: boolean;
  hasCommitSaveError: boolean;
  validationPassed: boolean;
  hasRunOrTestedCode: boolean;
  isJavabuilderConnecting: boolean;
  isCaptchaDialogOpen: boolean;
}

const initialState: JavalabState = {
  isRunning: false,
  isTesting: false,
  backpackEnabled: false,
  isStartMode: false,
  levelName: undefined,
  isReadOnlyWorkspace: false,
  hasOpenCodeReview: false,
  isCommitSaveInProgress: false,
  hasCommitSaveError: false,
  validationPassed: false,
  hasRunOrTestedCode: false,
  isJavabuilderConnecting: false,
  isCaptchaDialogOpen: false,
};

const javalabSlice = createSlice({
  name: 'javalab',
  initialState,
  reducers: {
    setIsRunning(state, action: PayloadAction<boolean>) {
      state.isRunning = action.payload;
    },
    setIsTesting(state, action: PayloadAction<boolean>) {
      state.isTesting = action.payload;
    },
    setBackpackEnabled(state, action: PayloadAction<boolean>) {
      state.backpackEnabled = action.payload;
    },
    /**
     * We should move isStartMode and levelName into a separate level redux file,
     * or convert this design to one more closely matching redux/applab. When we
     * do, we can remove the special treatment of Javalab in ImagePicker.jsx that
     * enables the Asset Manager to run.
     */
    setIsStartMode(state, action: PayloadAction<boolean>) {
      state.isStartMode = action.payload;
    },
    setLevelName(state, action: PayloadAction<string>) {
      state.levelName = action.payload;
    },
    setIsJavabuilderConnecting(state, action: PayloadAction<boolean>) {
      state.isJavabuilderConnecting = action.payload;
    },
    setIsReadOnlyWorkspace(state, action: PayloadAction<boolean>) {
      state.isReadOnlyWorkspace = action.payload;
    },
    setHasOpenCodeReview(state, action: PayloadAction<boolean>) {
      state.hasOpenCodeReview = action.payload;
    },
    setCommitSaveStatus(
      state,
      action: PayloadAction<{
        isCommitSaveInProgress: boolean;
        hasCommitSaveError: boolean;
      }>
    ) {
      state.isCommitSaveInProgress = action.payload.isCommitSaveInProgress;
      state.hasCommitSaveError = action.payload.hasCommitSaveError;
    },
    setValidationPassed(state, action: PayloadAction<boolean>) {
      state.validationPassed = action.payload;
    },
    setHasRunOrTestedCode(state, action: PayloadAction<boolean>) {
      state.hasRunOrTestedCode = action.payload;
    },
    setIsCaptchaDialogOpen(state, action: PayloadAction<boolean>) {
      state.isCaptchaDialogOpen = action.payload;
    },
  },
});

export const {
  setIsRunning,
  setIsTesting,
  setBackpackEnabled,
  setIsStartMode,
  setLevelName,
  setIsJavabuilderConnecting,
  setIsReadOnlyWorkspace,
  setHasOpenCodeReview,
  setCommitSaveStatus,
  setValidationPassed,
  setHasRunOrTestedCode,
  setIsCaptchaDialogOpen,
} = javalabSlice.actions;

export default javalabSlice.reducer;
