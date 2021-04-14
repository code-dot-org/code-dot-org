const APPEND_CONSOLE_LOG = 'javalab/APPEND_CONSOLE_LOG';
const SET_EDITOR_TEXT = 'javalab/SET_EDITOR_TEXT';
const SET_FILENAME = 'javalab/SET_FILENAME';
const SET_FILES_CHANGED = 'javalab/SET_FILES_CHANGED';
const TOGGLE_DARK_MODE = 'javalab/TOGGLE_DARK_MODE';

const initialState = {
  consoleLogs: [],
  editorText: '',
  filename: 'MyClass.java',
  filesChanged: false,
  isDarkMode: false
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

export const toggleDarkMode = () => ({
  type: TOGGLE_DARK_MODE
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
  if (action.type === TOGGLE_DARK_MODE) {
    return {
      ...state,
      isDarkMode: !state.isDarkMode
    };
  }
  return state;
}
