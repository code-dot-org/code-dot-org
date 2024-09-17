import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CodeBridgeConsoleState {
  output: ConsoleLog[];
}

export interface ConsoleLog {
  type:
    | 'system_out'
    | 'system_in'
    | 'img'
    | 'system_msg'
    | 'error'
    | 'system_error';
  contents: string;
}

export const initialState: CodeBridgeConsoleState = {
  output: [],
};

// SLICE
const consoleSlice = createSlice({
  name: 'codebridgeConsole',
  initialState,
  reducers: {
    appendSystemOutMessage(state, action: PayloadAction<string>) {
      state.output.push({type: 'system_out', contents: action.payload});
    },
    appendSystemInMessage(state, action: PayloadAction<string>) {
      state.output.push({type: 'system_in', contents: action.payload});
    },
    appendOutputImage(state, action: PayloadAction<string>) {
      state.output.push({type: 'img', contents: action.payload});
    },
    appendSystemMessage(state, action: PayloadAction<string>) {
      state.output.push({type: 'system_msg', contents: action.payload});
    },
    appendErrorMessage(state, action: PayloadAction<string>) {
      state.output.push({type: 'error', contents: action.payload});
    },
    appendSystemError(state, action: PayloadAction<string>) {
      state.output.push({type: 'system_error', contents: action.payload});
    },
    resetOutput(state) {
      state.output = [];
    },
  },
});

export const {
  appendSystemOutMessage,
  appendSystemInMessage,
  appendOutputImage,
  appendSystemMessage,
  appendErrorMessage,
  appendSystemError,
  resetOutput,
} = consoleSlice.actions;

export default consoleSlice.reducer;
