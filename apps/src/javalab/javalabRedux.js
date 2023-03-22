import UserPreferences from '../lib/util/UserPreferences';
import {DisplayTheme} from './DisplayTheme';
import {
  DEFAULT_FONT_SIZE_PX,
  FONT_SIZE_INCREMENT_PX,
  MAX_FONT_SIZE_PX,
  MIN_FONT_SIZE_PX
} from './editorThemes';
import {JavalabEditorDialog} from './JavalabEditorDialogManager';
import {
  fileMetadataForEditor,
  updateAllSourceFileOrders
} from './JavalabFileHelper';

const APPEND_CONSOLE_LOG = 'javalab/APPEND_CONSOLE_LOG';
const CLEAR_CONSOLE_LOGS = 'javalab/CLEAR_CONSOLE_LOGS';
const RENAME_FILE = 'javalab/RENAME_FILE';
const SET_SOURCE = 'javalab/SET_SOURCE';
const SOURCE_VISIBILITY_UPDATED = 'javalab/SOURCE_VISIBILITY_UPDATED';
const SOURCE_VALIDATION_UPDATED = 'javalab/SOURCE_VALIDATION_UPDATED';
const SOURCE_FILE_ORDER_UPDATED = 'javalab/SOURCE_FILE_ORDER_UPDATED';
const SOURCE_TEXT_UPDATED = 'javalab/SOURCE_TEXT_UPDATED';
const SET_ALL_SOURCES_AND_FILE_METADATA =
  'javalab/SET_ALL_SOURCES_AND_FILE_METADATA';
const SET_ALL_VALIDATION = 'javalab/SET_ALL_VALIDATION';
const COLOR_PREFERENCE_UPDATED = 'javalab/COLOR_PREFERENCE_UPDATED';
const EDITOR_HEIGHT_UPDATED = 'javalab/EDITOR_HEIGHT_UPDATED';
const LEFT_WIDTH_UPDATED = 'javalab/LEFT_WIDTH_UPDATED';
const RIGHT_WIDTH_UPDATED = 'javalab/RIGHT_WIDTH_UPDATED';
const SET_INSTRUCTIONS_HEIGHT = 'javalab/SET_INSTRUCTIONS_HEIGHT';
const SET_INSTRUCTIONS_FULL_HEIGHT = 'javalab/SET_INSTRUCTIONS_FULL_HEIGHT';
const REMOVE_FILE = 'javalab/REMOVE_FILE';
const SET_IS_RUNNING = 'javalab/SET_IS_RUNNING';
const SET_IS_TESTING = 'javalab/SET_IS_TESTING';
const SET_CONSOLE_HEIGHT = 'javalab/SET_CONSOLE_HEIGHT';
const EDITOR_COLUMN_HEIGHT = 'javalab/EDITOR_COLUMN_HEIGHT';
const SET_BACKPACK_CHANNEL_ID = 'javalab/SET_BACKPACK_CHANNEL_ID';
const SET_BACKPACK_ENABLED = 'javalab/SET_BACKPACK_ENABLED';
const SET_IS_START_MODE = 'javalab/SET_IS_START_MODE';
const SET_LEVEL_NAME = 'javalab/SET_LEVEL_NAME';
const TOGGLE_VISUALIZATION_COLLAPSED = 'javalab/TOGGLE_VISUALIZATION_COLLAPSED';
const OPEN_PHOTO_PROMPTER = 'javalab/OPEN_PHOTO_PROMPTER';
const CLOSE_PHOTO_PROMPTER = 'javalab/CLOSE_PHOTO_PROMPTER';
const SET_IS_READONLY_WORKSPACE = 'javalab/SET_IS_READONLY_WORKSPACE';
const SET_HAS_OPEN_CODE_REVIEW = 'javalab/SET_HAS_OPEN_CODE_REVIEW';
const SET_COMMIT_SAVE_STATUS = 'javalab/SET_COMMIT_SAVE_STATUS';
const SET_VALIDATION_PASSED = 'javalab/SET_VALIDATION_PASSED';
const SET_HAS_RUN_OR_TESTED = 'javalab/SET_HAS_RUN_OR_TESTED';
const SET_IS_JAVABUILDER_CONNECTING = 'javalab/SET_IS_JAVABUILDER_CONNECTING';
const SET_EDIT_TAB_KEY = 'javalab/SET_EDIT_TAB_KEY';
const SET_ACTIVE_TAB_KEY = 'javalab/SET_ACTIVE_TAB_KEY';
const SET_FILE_METADATA = 'javalab/SET_FILE_METADATA';
const SET_ORDERED_TAB_KEYS = 'javalab/SET_ORDERED_TAB_KEYS';
const SET_ALL_EDITOR_METADATA = 'javalab/SET_EDITOR_METADATA';
const OPEN_EDITOR_DIALOG = 'javalab/OPEN_EDITOR_DIALOG';
const CLOSE_EDITOR_DIALOG = 'javalab/CLOSE_EDITOR_DIALOG';
const SET_NEW_FILE_ERROR = 'javalab/SET_NEW_FILE_ERROR';
const CLEAR_NEW_FILE_ERROR = 'javalab/CLEAR_NEW_FILE_ERROR';
const SET_RENAME_FILE_ERROR = 'javalab/SET_RENAME_FILE_ERROR';
const CLEAR_RENAME_FILE_ERROR = 'javalab/CLEAR_RENAME_FILE_ERROR';
const INCREASE_EDITOR_FONT_SIZE = 'javalab/INCREASE_EDITOR_FONT_SIZE';
const DECREASE_EDITOR_FONT_SIZE = 'javalab/DECREASE_EDITOR_FONT_SIZE';

const initialSources = {
  'MyClass.java': {text: '', tabOrder: 0, isVisible: true, isValidation: false}
};

// Exported for test
export const initialState = {
  ...fileMetadataForEditor(initialSources),
  consoleLogs: [],
  sources: initialSources,
  displayTheme: DisplayTheme.LIGHT,
  validation: {},
  renderedEditorHeight: 400,
  leftWidth: 400,
  rightWidth: 400,
  instructionsHeight: 200,
  instructionsFullHeight: 200,
  isRunning: false,
  isTesting: false,
  consoleHeight: 200,
  editorColumnHeight: 600,
  backpackChannelId: null,
  backpackEnabled: false,
  isStartMode: false,
  levelName: undefined,
  isVisualizationCollapsed: false,
  isPhotoPrompterOpen: false,
  photoPrompterPromptText: '',
  isReadOnlyWorkspace: false,
  hasOpenCodeReview: false,
  isCommitSaveInProgress: false,
  hasCommitSaveError: false,
  validationPassed: false,
  hasRunOrTestedCode: false,
  editorOpenDialogName: null,
  newFileError: null,
  renameFileError: null,
  isJavabuilderConnecting: false,
  editorFontSize: DEFAULT_FONT_SIZE_PX,
  canIncreaseFontSize: DEFAULT_FONT_SIZE_PX < MAX_FONT_SIZE_PX,
  canDecreaseFontSize: DEFAULT_FONT_SIZE_PX > MIN_FONT_SIZE_PX
};

// Action Creators
export const appendInputLog = input => ({
  type: APPEND_CONSOLE_LOG,
  log: {type: 'input', text: input}
});

export const appendOutputLog = output => ({
  type: APPEND_CONSOLE_LOG,
  log: {type: 'output', text: output}
});

export const appendNewlineToConsoleLog = () => ({
  type: APPEND_CONSOLE_LOG,
  log: {type: 'newline'}
});

export const appendMarkdownLog = log => ({
  type: APPEND_CONSOLE_LOG,
  log: {type: 'markdown', text: log}
});

export const clearConsoleLogs = () => ({
  type: CLEAR_CONSOLE_LOGS
});

export const setAllValidation = validation => ({
  type: SET_ALL_VALIDATION,
  validation
});

export const setAllSourcesAndFileMetadata = (
  sources,
  isEditingStartSources
) => ({
  type: SET_ALL_SOURCES_AND_FILE_METADATA,
  sources,
  isEditingStartSources
});

export const renameFile = (oldFilename, newFilename) => ({
  type: RENAME_FILE,
  oldFilename,
  newFilename
});

export const setSource = (
  filename,
  source,
  tabOrder,
  isVisible = true,
  isValidation = false
) => ({
  type: SET_SOURCE,
  filename,
  source,
  tabOrder,
  isVisible,
  isValidation
});

// Handles updates to text within Code Mirror (ie, when text is edited)
export const sourceTextUpdated = (filename, text) => ({
  type: SOURCE_TEXT_UPDATED,
  filename,
  text
});

export const sourceVisibilityUpdated = (filename, isVisible) => ({
  type: SOURCE_VISIBILITY_UPDATED,
  filename,
  isVisible
});

export const sourceValidationUpdated = (filename, isValidation) => ({
  type: SOURCE_VALIDATION_UPDATED,
  filename,
  isValidation
});

export const sourceFileOrderUpdated = () => ({
  type: SOURCE_FILE_ORDER_UPDATED
});

// Updates the user preferences to reflect change
export const setDisplayTheme = displayTheme => {
  new UserPreferences().setDisplayTheme(displayTheme);
  return {
    displayTheme: displayTheme,
    type: COLOR_PREFERENCE_UPDATED
  };
};

export const removeFile = filename => ({
  type: REMOVE_FILE,
  filename
});

export const setIsRunning = isRunning => ({
  type: SET_IS_RUNNING,
  isRunning
});

export const setIsTesting = isTesting => ({
  type: SET_IS_TESTING,
  isTesting
});

export const setBackpackChannelId = backpackChannelId => ({
  type: SET_BACKPACK_CHANNEL_ID,
  backpackChannelId
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

export const openPhotoPrompter = promptText => ({
  type: OPEN_PHOTO_PROMPTER,
  promptText
});

export const closePhotoPrompter = () => ({
  type: CLOSE_PHOTO_PROMPTER
});

export const openEditorDialog = dialogName => ({
  type: OPEN_EDITOR_DIALOG,
  dialogName
});

export const closeEditorDialog = () => ({
  type: CLOSE_EDITOR_DIALOG
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

// Selectors
export const getSources = state => {
  let sources = {};
  for (let key in state.javalab.sources) {
    if (!state.javalab.sources[key].isValidation) {
      sources[key] = {
        text: state.javalab.sources[key].text,
        isVisible: state.javalab.sources[key].isVisible,
        tabOrder: state.javalab.sources[key].tabOrder
      };
    }
  }
  return sources;
};

export const getValidation = state => {
  let validation = {};
  for (let key in state.javalab.sources) {
    if (state.javalab.sources[key].isValidation) {
      validation[key] = {
        text: state.javalab.sources[key].text,
        tabOrder: state.javalab.sources[key].tabOrder
      };
    }
  }
  return validation;
};

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

export const setEditTabKey = editTabKey => {
  return {
    type: SET_EDIT_TAB_KEY,
    editTabKey
  };
};

export const setActiveTabKey = activeTabKey => {
  return {
    type: SET_ACTIVE_TAB_KEY,
    activeTabKey
  };
};

export const setFileMetadata = fileMetadata => {
  return {
    type: SET_FILE_METADATA,
    fileMetadata
  };
};

export const setOrderedTabKeys = orderedTabKeys => {
  return {
    type: SET_ORDERED_TAB_KEYS,
    orderedTabKeys
  };
};

export const setAllEditorMetadata = (
  fileMetadata,
  orderedTabKeys,
  activeTabKey,
  lastTabKeyIndex
) => {
  return {
    type: SET_ALL_EDITOR_METADATA,
    fileMetadata,
    orderedTabKeys,
    activeTabKey,
    lastTabKeyIndex
  };
};

export const setNewFileError = error => ({
  type: SET_NEW_FILE_ERROR,
  error: error
});

export const clearNewFileError = () => ({
  type: CLEAR_NEW_FILE_ERROR
});

export const setRenameFileError = error => ({
  type: SET_RENAME_FILE_ERROR,
  error: error
});

export const clearRenameFileError = () => ({
  type: CLEAR_RENAME_FILE_ERROR
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
  if (action.type === APPEND_CONSOLE_LOG) {
    return {
      ...state,
      consoleLogs: [...state.consoleLogs, action.log]
    };
  }
  if (action.type === CLEAR_CONSOLE_LOGS) {
    return {
      ...state,
      consoleLogs: []
    };
  }
  if (action.type === SET_SOURCE) {
    let newSources = {...state.sources};
    newSources[action.filename] = {
      text: action.source,
      tabOrder: action.tabOrder,
      isVisible: action.isVisible,
      isValidation: action.isValidation
    };
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === SOURCE_VISIBILITY_UPDATED) {
    let newSources = {...state.sources};
    newSources[action.filename].isVisible = action.isVisible;
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === SOURCE_VALIDATION_UPDATED) {
    let newSources = {...state.sources};
    newSources[action.filename].isValidation = action.isValidation;
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === SOURCE_TEXT_UPDATED) {
    let newSources = {...state.sources};
    newSources[action.filename].text = action.text;
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === RENAME_FILE) {
    const source = state.sources[action.oldFilename];
    if (source !== undefined) {
      let newSources = {...state.sources};
      delete newSources[action.oldFilename];
      newSources[action.newFilename] = source;
      return {
        ...state,
        sources: newSources
      };
    } else {
      // if old filename doesn't exist, can't do a rename
      return state;
    }
  }
  if (action.type === REMOVE_FILE) {
    let newSources = {...state.sources};
    delete newSources[action.filename];
    return {
      ...state,
      sources: newSources
    };
  }
  if (action.type === SOURCE_FILE_ORDER_UPDATED) {
    let sources = {...state.sources};
    let orderedTabKeys = state.orderedTabKeys;
    let fileMetadata = state.fileMetadata;
    const updatedSources = updateAllSourceFileOrders(
      sources,
      fileMetadata,
      orderedTabKeys
    );
    return {
      ...state,
      sources: updatedSources
    };
  }
  if (action.type === SET_ALL_SOURCES_AND_FILE_METADATA) {
    const {
      fileMetadata,
      orderedTabKeys,
      activeTabKey,
      lastTabKeyIndex
    } = fileMetadataForEditor(action.sources, action.isEditingStartSources);
    const updatedSources = updateAllSourceFileOrders(
      action.sources,
      fileMetadata,
      orderedTabKeys
    );

    return {
      ...state,
      sources: updatedSources,
      fileMetadata,
      orderedTabKeys,
      activeTabKey,
      lastTabKeyIndex
    };
  }
  if (action.type === SET_ALL_VALIDATION) {
    return {
      ...state,
      validation: action.validation
    };
  }
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
  if (action.type === SET_BACKPACK_CHANNEL_ID) {
    return {
      ...state,
      backpackChannelId: action.backpackChannelId
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
  if (action.type === OPEN_PHOTO_PROMPTER) {
    return {
      ...state,
      isPhotoPrompterOpen: true,
      photoPrompterPromptText: action.promptText
    };
  }
  if (action.type === CLOSE_PHOTO_PROMPTER) {
    return {
      ...state,
      isPhotoPrompterOpen: false,
      photoPrompterPromptText: ''
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
  if (action.type === SET_EDIT_TAB_KEY) {
    return {
      ...state,
      editTabKey: action.editTabKey
    };
  }
  if (action.type === SET_ACTIVE_TAB_KEY) {
    return {
      ...state,
      activeTabKey: action.activeTabKey
    };
  }
  if (action.type === SET_ORDERED_TAB_KEYS) {
    return {
      ...state,
      orderedTabKeys: action.orderedTabKeys
    };
  }
  if (action.type === SET_FILE_METADATA) {
    return {
      ...state,
      fileMetadata: action.fileMetadata
    };
  }
  if (action.type === SET_ALL_EDITOR_METADATA) {
    return {
      ...state,
      fileMetadata: action.fileMetadata,
      orderedTabKeys: action.orderedTabKeys,
      activeTabKey: action.activeTabKey,
      lastTabKeyIndex: action.lastTabKeyIndex || state.lastTabKeyIndex
    };
  }
  if (action.type === OPEN_EDITOR_DIALOG) {
    if (JavalabEditorDialog[action.dialogName] !== undefined) {
      return {
        ...state,
        editorOpenDialogName: action.dialogName
      };
    }
  }
  if (action.type === CLOSE_EDITOR_DIALOG) {
    return {
      ...state,
      editorOpenDialogName: null
    };
  }

  if (action.type === SET_NEW_FILE_ERROR) {
    return {
      ...state,
      newFileError: action.error
    };
  }

  if (action.type === CLEAR_NEW_FILE_ERROR) {
    return {
      ...state,
      newFileError: null
    };
  }

  if (action.type === SET_RENAME_FILE_ERROR) {
    return {
      ...state,
      renameFileError: action.error
    };
  }

  if (action.type === CLEAR_RENAME_FILE_ERROR) {
    return {
      ...state,
      renameFileError: null
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
