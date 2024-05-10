import {createSlice, PayloadAction} from '@reduxjs/toolkit';
const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface PythonlabState {
  output: ConsoleLog[];
}

export interface ConsoleLog {
  type: 'system_out' | 'system_in' | 'img' | 'system_msg';
  contents: string;
}

export const initialState: PythonlabState = {
  output: [],
};

// SLICE
const pythonlabSlice = createSlice({
  name: 'pythonlab',
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
    resetOutput(state) {
      state.output = [];
    },
  },
});

registerReducers({pythonlab: pythonlabSlice.reducer});

export const {
  appendSystemOutMessage,
  appendSystemInMessage,
  appendOutputImage,
  appendSystemMessage,
  resetOutput,
} = pythonlabSlice.actions;
