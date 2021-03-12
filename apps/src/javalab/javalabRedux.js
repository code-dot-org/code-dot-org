const APPEND_CONSOLE_LOG = 'javalab/APPEND_CONSOLE_LOG';
const SET_EDITOR_TEXT = 'javalab/SET_EDITOR_TEXT';
const SET_FILENAME = 'javalab/SET_FILENAME';

const initialState = {
  consoleLogs: [],
  editorText: '',
  filename: 'MyClass.java'
};

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
      editorText: action.editorText
    };
  }
  if (action.type === SET_FILENAME) {
    return {
      ...state,
      filename: action.filename
    };
  }
  return state;
}
