import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MultiFileSource} from '@cdo/apps/lab2/types';
const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface PythonlabState {
  source: MultiFileSource | undefined;
  output: string[];
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
    appendOutput(state, action: PayloadAction<string>) {
      state.output.push(action.payload);
    },
    resetOutput(state) {
      state.output = [];
    },
  },
});

registerReducers({pythonlab: pythonlabSlice.reducer});

export const {setSource, appendOutput, resetOutput} = pythonlabSlice.actions;
