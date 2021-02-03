const APPEND_CONSOLE_OUTPUT = 'javalab/APPEND_CONSOLE_OUTPUT';
const SET_EDITOR_TEXT = 'javalab/SET_EDITOR_TEXT';

const initialState = {
  consoleOutput: [],
  editorText: ''
};

export const appendLog = output => ({
  type: APPEND_CONSOLE_OUTPUT,
  output
});

export const setEditorText = editorText => ({
  type: SET_EDITOR_TEXT,
  editorText
});

export default function reducer(state = initialState, action) {
  if (action.type === APPEND_CONSOLE_OUTPUT) {
    return {
      ...state,
      consoleOutput: [...state.consoleOutput, action.output]
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
