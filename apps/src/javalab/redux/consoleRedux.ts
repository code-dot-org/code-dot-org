// Redux store for state that relates to the Java Lab console.
import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface ConsoleLog {
  type: 'input' | 'output' | 'newline' | 'markdown';
  text?: string;
}

interface JavalabConsoleState {
  consoleLogs: ConsoleLog[];
  isPhotoPrompterOpen: boolean;
  photoPrompterPromptText: string;
}

const initialState: JavalabConsoleState = {
  consoleLogs: [],
  isPhotoPrompterOpen: false,
  photoPrompterPromptText: '',
};

const javalabConsoleSlice = createSlice({
  name: 'javalabConsole',
  initialState,
  reducers: {
    appendInputLog(state, action: PayloadAction<string>) {
      state.consoleLogs.push({type: 'input', text: action.payload});
    },
    appendOutputLog(state, action: PayloadAction<string>) {
      state.consoleLogs.push({type: 'output', text: action.payload});
    },
    appendNewlineToConsoleLog(state) {
      state.consoleLogs.push({type: 'newline'});
    },
    appendMarkdownLog(state, action: PayloadAction<string>) {
      state.consoleLogs.push({type: 'markdown', text: action.payload});
    },
    clearConsoleLogs(state) {
      state.consoleLogs = [];
    },
    openPhotoPrompter(state, action: PayloadAction<string>) {
      state.isPhotoPrompterOpen = true;
      state.photoPrompterPromptText = action.payload;
    },
    closePhotoPrompter(state) {
      state.isPhotoPrompterOpen = false;
      state.photoPrompterPromptText = '';
    },
  },
});

export const {
  appendInputLog,
  appendOutputLog,
  appendNewlineToConsoleLog,
  appendMarkdownLog,
  clearConsoleLogs,
  openPhotoPrompter,
  closePhotoPrompter,
} = javalabConsoleSlice.actions;

export default javalabConsoleSlice.reducer;
