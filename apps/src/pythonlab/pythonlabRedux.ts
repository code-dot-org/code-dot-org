import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MultiFileSource} from '@cdo/apps/lab2/types';
const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface PythonlabState {
  source: MultiFileSource | undefined;
  output: ConsoleLog[];
}

export interface ConsoleLog {
  type: 'system_out' | 'system_in' | 'img' | 'system_msg';
  contents: string;
}

export const initialState: PythonlabState = {
  source: undefined,
  output: [],
};

const pythonlabSlice = createSlice({
  name: 'pythonlab',
  initialState,
  reducers: {
    setSource(state, action: PayloadAction<MultiFileSource>) {
      state.source = action.payload;
    },
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
  setSource,
  appendSystemOutMessage,
  appendSystemInMessage,
  appendOutputImage,
  appendSystemMessage,
  resetOutput,
} = pythonlabSlice.actions;
