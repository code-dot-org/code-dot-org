import {createSlice, PayloadAction} from '@reduxjs/toolkit';
const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface PythonlabState {
  code: string;
  output: string[];
}

export const initialState: PythonlabState = {
  code: '',
  output: [],
};

const pythonlabSlice = createSlice({
  name: 'pythonlab',
  initialState,
  reducers: {
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
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

export const {setCode, appendOutput, resetOutput} = pythonlabSlice.actions;
