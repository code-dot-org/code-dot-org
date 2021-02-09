const APPEND_CONSOLE_LOG = 'javaIde/APPEND_CONSOLE_LOG';
const SET_EDITOR_TEXT = 'javaIde/SET_EDITOR_TEXT';

const initialState = {
  consoleLogs: [],
  editorText: ''
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
  return state;
}
