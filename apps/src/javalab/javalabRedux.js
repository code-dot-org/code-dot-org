const APPEND_CONSOLE_LOG = 'javalab/APPEND_CONSOLE_LOG';
const RENAME_FILE = 'javalab/RENAME_FILE';
const SET_SOURCE = 'javalab/SET_SOURCE';
const SET_ALL_SOURCES = 'javalab/SET_ALL_SOURCES';

const initialState = {
  consoleLogs: [],
  sources: {'MyClass.java': {text: '', visible: true}}
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

export const setAllSources = sources => ({
  type: SET_ALL_SOURCES,
  sources
});

export const renameFile = (oldFilename, newFilename) => ({
  type: RENAME_FILE,
  oldFilename,
  newFilename
});

export const setSource = (filename, source, isVisible = true) => ({
  type: SET_SOURCE,
  filename,
  source,
  isVisible
});

// Selectors
export const getSources = state => {
  return state.javalab.sources;
};

export const getProjectFileInfo = state => {
  // TODO: enable multi-file
  let data = {};
  data[state.javalab.filename] = {
    text: state.javalab.editorText,
    visible: true
  };
  return data;
};

// Reducer
export default function reducer(state = initialState, action) {
  if (action.type === APPEND_CONSOLE_LOG) {
    return {
      ...state,
      consoleLogs: [...state.consoleLogs, action.log]
    };
  }
  if (action.type === SET_SOURCE) {
    let newSources = {...state.sources};
    newSources[action.filename] = {
      text: action.source,
      visible: action.isVisible
    };
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
  if (action.type === SET_ALL_SOURCES) {
    return {
      ...state,
      sources: action.sources
    };
  }
  return state;
}
