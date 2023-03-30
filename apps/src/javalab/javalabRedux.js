import UserPreferences from '../lib/util/UserPreferences';
import {DisplayTheme} from './DisplayTheme';
import {
  DEFAULT_FONT_SIZE_PX,
  FONT_SIZE_INCREMENT_PX,
  MAX_FONT_SIZE_PX,
  MIN_FONT_SIZE_PX
} from './editorThemes';

const COLOR_PREFERENCE_UPDATED = 'javalab/COLOR_PREFERENCE_UPDATED';
const EDITOR_HEIGHT_UPDATED = 'javalab/EDITOR_HEIGHT_UPDATED';
const LEFT_WIDTH_UPDATED = 'javalab/LEFT_WIDTH_UPDATED';
const RIGHT_WIDTH_UPDATED = 'javalab/RIGHT_WIDTH_UPDATED';
const SET_INSTRUCTIONS_HEIGHT = 'javalab/SET_INSTRUCTIONS_HEIGHT';
const SET_INSTRUCTIONS_FULL_HEIGHT = 'javalab/SET_INSTRUCTIONS_FULL_HEIGHT';
const SET_IS_RUNNING = 'javalab/SET_IS_RUNNING';
const SET_IS_TESTING = 'javalab/SET_IS_TESTING';
const SET_CONSOLE_HEIGHT = 'javalab/SET_CONSOLE_HEIGHT';
const EDITOR_COLUMN_HEIGHT = 'javalab/EDITOR_COLUMN_HEIGHT';
const SET_BACKPACK_ENABLED = 'javalab/SET_BACKPACK_ENABLED';
const SET_IS_START_MODE = 'javalab/SET_IS_START_MODE';
const SET_LEVEL_NAME = 'javalab/SET_LEVEL_NAME';
const TOGGLE_VISUALIZATION_COLLAPSED = 'javalab/TOGGLE_VISUALIZATION_COLLAPSED';
const SET_IS_READONLY_WORKSPACE = 'javalab/SET_IS_READONLY_WORKSPACE';
const SET_HAS_OPEN_CODE_REVIEW = 'javalab/SET_HAS_OPEN_CODE_REVIEW';
const SET_COMMIT_SAVE_STATUS = 'javalab/SET_COMMIT_SAVE_STATUS';
const SET_VALIDATION_PASSED = 'javalab/SET_VALIDATION_PASSED';
const SET_HAS_RUN_OR_TESTED = 'javalab/SET_HAS_RUN_OR_TESTED';
const SET_IS_JAVABUILDER_CONNECTING = 'javalab/SET_IS_JAVABUILDER_CONNECTING';
const INCREASE_EDITOR_FONT_SIZE = 'javalab/INCREASE_EDITOR_FONT_SIZE';
const DECREASE_EDITOR_FONT_SIZE = 'javalab/DECREASE_EDITOR_FONT_SIZE';

// Exported for test
export const initialState = {
  displayTheme: DisplayTheme.LIGHT,
  renderedEditorHeight: 400,
  leftWidth: 400,
  rightWidth: 400,
  instructionsHeight: 200,
  instructionsFullHeight: 200,
  isRunning: false,
  isTesting: false,
  consoleHeight: 200,
  editorColumnHeight: 600,
  backpackEnabled: false,
  isStartMode: false,
  levelName: undefined,
  isVisualizationCollapsed: false,
  isReadOnlyWorkspace: false,
  hasOpenCodeReview: false,
  isCommitSaveInProgress: false,
  hasCommitSaveError: false,
  validationPassed: false,
  hasRunOrTestedCode: false,
  isJavabuilderConnecting: false,
  editorFontSize: DEFAULT_FONT_SIZE_PX,
  canIncreaseFontSize: DEFAULT_FONT_SIZE_PX < MAX_FONT_SIZE_PX,
  canDecreaseFontSize: DEFAULT_FONT_SIZE_PX > MIN_FONT_SIZE_PX
};

// Updates the user preferences to reflect change
export const setDisplayTheme = displayTheme => {
  new UserPreferences().setDisplayTheme(displayTheme);
  return {
    displayTheme: displayTheme,
    type: COLOR_PREFERENCE_UPDATED
  };
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

export const toggleVisualizationCollapsed = () => ({
  type: TOGGLE_VISUALIZATION_COLLAPSED
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

export const increaseEditorFontSize = () => ({
  type: INCREASE_EDITOR_FONT_SIZE
});

export const decreaseEditorFontSize = () => ({
  type: DECREASE_EDITOR_FONT_SIZE
});

export const setRenderedHeight = height => ({
  type: EDITOR_HEIGHT_UPDATED,
  height
});

export const setLeftWidth = width => ({
  type: LEFT_WIDTH_UPDATED,
  width
});

export const setRightWidth = width => ({
  type: RIGHT_WIDTH_UPDATED,
  width
});

export const setInstructionsHeight = height => ({
  type: SET_INSTRUCTIONS_HEIGHT,
  height
});

export const setInstructionsFullHeight = height => ({
  type: SET_INSTRUCTIONS_FULL_HEIGHT,
  height
});

export const setConsoleHeight = height => ({
  type: SET_CONSOLE_HEIGHT,
  height
});

export const setEditorColumnHeight = editorColumnHeight => ({
  type: EDITOR_COLUMN_HEIGHT,
  editorColumnHeight
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
  if (action.type === COLOR_PREFERENCE_UPDATED) {
    return {
      ...state,
      displayTheme: action.displayTheme
    };
  }
  if (action.type === EDITOR_HEIGHT_UPDATED) {
    return {
      ...state,
      renderedEditorHeight: action.height
    };
  }
  if (action.type === LEFT_WIDTH_UPDATED) {
    return {
      ...state,
      leftWidth: action.width
    };
  }
  if (action.type === RIGHT_WIDTH_UPDATED) {
    return {
      ...state,
      rightWidth: action.width
    };
  }
  if (action.type === SET_INSTRUCTIONS_HEIGHT) {
    return {
      ...state,
      instructionsHeight: action.height
    };
  }
  if (action.type === SET_INSTRUCTIONS_FULL_HEIGHT) {
    return {
      ...state,
      instructionsFullHeight: action.height
    };
  }
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
  if (action.type === SET_CONSOLE_HEIGHT) {
    return {
      ...state,
      consoleHeight: action.height
    };
  }
  if (action.type === EDITOR_COLUMN_HEIGHT) {
    return {
      ...state,
      editorColumnHeight: action.editorColumnHeight
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
  if (action.type === TOGGLE_VISUALIZATION_COLLAPSED) {
    return {
      ...state,
      isVisualizationCollapsed: !state.isVisualizationCollapsed
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
  if (action.type === INCREASE_EDITOR_FONT_SIZE) {
    const newFontSize = Math.min(
      MAX_FONT_SIZE_PX,
      state.editorFontSize + FONT_SIZE_INCREMENT_PX
    );
    return {
      ...state,
      editorFontSize: newFontSize,
      canIncreaseFontSize: newFontSize < MAX_FONT_SIZE_PX,
      canDecreaseFontSize: newFontSize > MIN_FONT_SIZE_PX
    };
  }
  if (action.type === DECREASE_EDITOR_FONT_SIZE) {
    const newFontSize = Math.max(
      MIN_FONT_SIZE_PX,
      state.editorFontSize - FONT_SIZE_INCREMENT_PX
    );
    return {
      ...state,
      editorFontSize: newFontSize,
      canIncreaseFontSize: newFontSize < MAX_FONT_SIZE_PX,
      canDecreaseFontSize: newFontSize > MIN_FONT_SIZE_PX
    };
  }
  return state;
}
