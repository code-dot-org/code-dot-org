import {createSlice, PayloadAction} from '@reduxjs/toolkit';
const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface PythonlabState {
  source: NestedSourceCode | undefined;
  output: string[];
}

// A potentially deeply nested object of source code, where keys are file or folder names
// and values are folders or individual file contents.
export type NestedSourceCode = {[key: string]: string | NestedSourceCode};

export const initialState: PythonlabState = {
  source: undefined,
  output: [],
};

const pythonlabSlice = createSlice({
  name: 'pythonlab',
  initialState,
  reducers: {
    setSource(state, action: PayloadAction<NestedSourceCode>) {
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
