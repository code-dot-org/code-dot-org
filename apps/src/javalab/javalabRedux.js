import UserPreferences from '../lib/util/UserPreferences';
import {DisplayTheme} from './DisplayTheme';

const APPEND_CONSOLE_LOG = 'javalab/APPEND_CONSOLE_LOG';
const CLEAR_CONSOLE_LOGS = 'javalab/CLEAR_CONSOLE_LOGS';
const RENAME_FILE = 'javalab/RENAME_FILE';
const SET_SOURCE = 'javalab/SET_SOURCE';
const SOURCE_VISIBILITY_UPDATED = 'javalab/SOURCE_VISIBILITY_UPDATED';
const SOURCE_VALIDATION_UPDATED = 'javalab/SOURCE_VALIDATION_UPDATED';
const SET_ALL_SOURCES = 'javalab/SET_ALL_SOURCES';
const SET_ALL_VALIDATION = 'javalab/SET_ALL_VALIDATION';
const COLOR_PREFERENCE_UPDATED = 'javalab/COLOR_PREFERENCE_UPDATED';
const EDITOR_HEIGHT_UPDATED = 'javalab/EDITOR_HEIGHT_UPDATED';
const REMOVE_FILE = 'javalab/REMOVE_FILE';
const SET_IS_RUNNING = 'javalab/SET_IS_RUNNING';
const SET_BACKPACK_API = 'javalab/SET_BACKPACK_API';

const initialState = {
  consoleLogs: [],
  sources: {'MyClass.java': {text: '', isVisible: true, isValidation: false}},
  isDarkMode: false,
  validation: {},
  renderedEditorHeight: 400,
  isRunning: false,
  backpackApi: null
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

export const clearConsoleLogs = () => ({
  type: CLEAR_CONSOLE_LOGS
});

export const setAllValidation = validation => ({
  type: SET_ALL_VALIDATION,
  validation
});

export const setAllSources = sources => ({
  type: SET_ALL_SOURCES,
  sources
});

export const renameFile = (oldFilename, newFilename) => ({
  type: RENAME_FILE,
  oldFilename,
  newFilename
});

export const setSource = (
  filename,
  source,
  isVisible = true,
  isValidation = false
) => ({
  type: SET_SOURCE,
  filename,
  source,
  isVisible,
  isValidation
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

// Updates the user preferences to reflect change
export const setIsDarkMode = isDarkMode => {
  new UserPreferences().setDisplayTheme(
    isDarkMode ? DisplayTheme.DARK : DisplayTheme.LIGHT
  );
  return {
    isDarkMode: isDarkMode,
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

export const setBackpackApi = backpackApi => ({
  type: SET_BACKPACK_API,
  backpackApi
});

// Selectors
export const getSources = state => {
  let sources = {};
  for (let key in state.javalab.sources) {
    if (!state.javalab.sources[key].isValidation) {
      sources[key] = {
        text: state.javalab.sources[key].text,
        isVisible: state.javalab.sources[key].isVisible
      };
    }
  }
  return sources;
};

export const getValidation = state => {
  let validation = {};
  for (let key in state.javalab.sources) {
    if (state.javalab.sources[key].isValidation) {
      validation[key] = {text: state.javalab.sources[key].text};
    }
  }
  return validation;
};

export const setRenderedHeight = height => ({
  type: EDITOR_HEIGHT_UPDATED,
  height
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
  if (action.type === SET_ALL_SOURCES) {
    return {
      ...state,
      sources: action.sources
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
      isDarkMode: action.isDarkMode
    };
  }
  if (action.type === EDITOR_HEIGHT_UPDATED) {
    return {
      ...state,
      renderedEditorHeight: action.height
    };
  }
  if (action.type === SET_IS_RUNNING) {
    return {
      ...state,
      isRunning: action.isRunning
    };
  }
  if (action.type === SET_BACKPACK_API) {
    return {
      ...state,
      backpackApi: action.backpackApi
    };
  }
  return state;
}
