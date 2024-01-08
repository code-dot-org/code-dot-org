import {createSlice, PayloadAction} from '@reduxjs/toolkit';
const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface PythonlabState {
  code: string;
}

export const initialState: PythonlabState = {
  code: '',
};

const pythonlabSlice = createSlice({
  name: 'pythonlab',
  initialState,
  reducers: {
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
  },
});

registerReducers({pythonlab: pythonlabSlice.reducer});

export const {setCode} = pythonlabSlice.actions;
