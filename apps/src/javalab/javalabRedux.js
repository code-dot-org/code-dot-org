const APPEND_CONSOLE_LOG = 'javalab/APPEND_CONSOLE_LOG';
const SET_EDITOR_TEXT = 'javalab/SET_EDITOR_TEXT';
const SET_FILENAME = 'javalab/SET_FILENAME';
const SET_FILES_CHANGED = 'javalab/SET_FILES_CHANGED';
const RENAME_FILE = 'javalab/RENAME_FILE';
const SET_SOURCE = 'javalab/SET_SOURCE';
const SET_ALL_SOURCES = 'javalab/SET_ALL_SOURCES';

const initialState = {
  consoleLogs: [],
  editorText: '',
  filename: 'MyClass.java',
  filesChanged: false,
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

export const setEditorText = editorText => ({
  type: SET_EDITOR_TEXT,
  editorText
});

export const setFileName = filename => ({
  type: SET_FILENAME,
  filename
});

export const setFilesChanged = filesChanged => ({
  type: SET_FILES_CHANGED,
  filesChanged
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
export const getFilesChanged = state => {
  return state.javalab.filesChanged;
};

export const getFilename = state => {
  return state.javalab.filename;
};

export const getEditorText = state => {
  return state.javalab.editorText;
};

export const getSources = state => {
  return state.javalab.sources;
};

// Reducer
export default function reducer(state = initialState, action) {
  if (action.type === APPEND_CONSOLE_LOG) {
    return {
      ...state,
      consoleLogs: [...state.consoleLogs, action.log]
    };
  }
  if (action.type === SET_EDITOR_TEXT) {
    return {
      ...state,
      editorText: action.editorText,
      filesChanged: true
    };
  }
  if (action.type === SET_FILENAME) {
    return {
      ...state,
      filename: action.filename
    };
  }
  if (action.type === SET_FILES_CHANGED) {
    return {
      ...state,
      filesChanged: action.filesChanged
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
