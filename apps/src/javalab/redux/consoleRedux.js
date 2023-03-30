// Redux store for state that relates to the Java Lab console.

const APPEND_CONSOLE_LOG = 'javalab/APPEND_CONSOLE_LOG';
const CLEAR_CONSOLE_LOGS = 'javalab/CLEAR_CONSOLE_LOGS';
const OPEN_PHOTO_PROMPTER = 'javalab/OPEN_PHOTO_PROMPTER';
const CLOSE_PHOTO_PROMPTER = 'javalab/CLOSE_PHOTO_PROMPTER';

const initialState = {
  consoleLogs: [],
  isPhotoPrompterOpen: false,
  photoPrompterPromptText: ''
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

export const openPhotoPrompter = promptText => ({
  type: OPEN_PHOTO_PROMPTER,
  promptText
});

export const closePhotoPrompter = () => ({
  type: CLOSE_PHOTO_PROMPTER
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
  return state;
}
