/**
 * Redux store for generic Java Lab state.
 */

const SET_IS_RUNNING = 'javalab/SET_IS_RUNNING';
const SET_IS_TESTING = 'javalab/SET_IS_TESTING';
const SET_BACKPACK_ENABLED = 'javalab/SET_BACKPACK_ENABLED';
const SET_IS_START_MODE = 'javalab/SET_IS_START_MODE';
const SET_LEVEL_NAME = 'javalab/SET_LEVEL_NAME';
const SET_IS_READONLY_WORKSPACE = 'javalab/SET_IS_READONLY_WORKSPACE';
const SET_HAS_OPEN_CODE_REVIEW = 'javalab/SET_HAS_OPEN_CODE_REVIEW';
const SET_COMMIT_SAVE_STATUS = 'javalab/SET_COMMIT_SAVE_STATUS';
const SET_VALIDATION_PASSED = 'javalab/SET_VALIDATION_PASSED';
const SET_HAS_RUN_OR_TESTED = 'javalab/SET_HAS_RUN_OR_TESTED';
const SET_IS_JAVABUILDER_CONNECTING = 'javalab/SET_IS_JAVABUILDER_CONNECTING';

const initialState = {
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
  isJavabuilderConnecting: false
};

export const setIsRunning = isRunning => ({
  type: SET_IS_RUNNING,
  isRunning
});

export const setIsTesting = isTesting => ({
  type: SET_IS_TESTING,
  isTesting
});

export const setBackpackEnabled = backpackEnabled => ({
  type: SET_BACKPACK_ENABLED,
  backpackEnabled
});

/**
 * We should move isStartMode and levelName into a separate level redux file,
 * or convert this design to one more closely matching redux/applab. When we
 * do, we can remove the special treatment of Javalab in ImagePicker.jsx that
 * enables the Asset Manager to run.
 */
export const setIsStartMode = isStartMode => ({
  type: SET_IS_START_MODE,
  isStartMode
});

export const setLevelName = levelName => ({
  type: SET_LEVEL_NAME,
  levelName
});

export const setIsJavabuilderConnecting = isJavabuilderConnecting => ({
  type: SET_IS_JAVABUILDER_CONNECTING,
  isJavabuilderConnecting
});

export const setIsReadOnlyWorkspace = isReadOnlyWorkspace => ({
  type: SET_IS_READONLY_WORKSPACE,
  isReadOnlyWorkspace
});

export const setHasOpenCodeReview = hasOpenCodeReview => ({
  type: SET_HAS_OPEN_CODE_REVIEW,
  hasOpenCodeReview
});

export const setCommitSaveStatus = (
  isCommitSaveInProgress,
  hasCommitSaveError
) => ({
  type: SET_COMMIT_SAVE_STATUS,
  isCommitSaveInProgress,
  hasCommitSaveError
});

export const setValidationPassed = validationPassed => ({
  type: SET_VALIDATION_PASSED,
  validationPassed
});

export const setHasRunOrTestedCode = hasRunOrTestedCode => ({
  type: SET_HAS_RUN_OR_TESTED,
  hasRunOrTestedCode
});

// Reducer
export default function reducer(state = initialState, action) {
  if (action.type === SET_IS_RUNNING) {
    return {
      ...state,
      isRunning: action.isRunning
    };
  }
  if (action.type === SET_IS_TESTING) {
    return {
      ...state,
      isTesting: action.isTesting
    };
  }
  if (action.type === SET_BACKPACK_ENABLED) {
    return {
      ...state,
      backpackEnabled: action.backpackEnabled
    };
  }
  if (action.type === SET_IS_START_MODE) {
    return {
      ...state,
      isStartMode: action.isStartMode
    };
  }
  if (action.type === SET_LEVEL_NAME) {
    return {
      ...state,
      levelName: action.levelName
    };
  }
  if (action.type === SET_IS_READONLY_WORKSPACE) {
    return {
      ...state,
      isReadOnlyWorkspace: action.isReadOnlyWorkspace
    };
  }
  if (action.type === SET_HAS_OPEN_CODE_REVIEW) {
    return {
      ...state,
      hasOpenCodeReview: action.hasOpenCodeReview
    };
  }
  if (action.type === SET_COMMIT_SAVE_STATUS) {
    return {
      ...state,
      isCommitSaveInProgress: action.isCommitSaveInProgress,
      hasCommitSaveError: action.hasCommitSaveError
    };
  }
  if (action.type === SET_VALIDATION_PASSED) {
    return {
      ...state,
      validationPassed: action.validationPassed
    };
  }
  if (action.type === SET_HAS_RUN_OR_TESTED) {
    return {
      ...state,
      hasRunOrTestedCode: action.hasRunOrTestedCode
    };
  }
  if (action.type === SET_IS_JAVABUILDER_CONNECTING) {
    return {
      ...state,
      isJavabuilderConnecting: action.isJavabuilderConnecting
    };
  }
  return state;
}
