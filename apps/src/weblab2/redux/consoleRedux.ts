import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

export type ConsoleLogLevel = 'log' | 'warn' | 'error' | 'info';

export interface ConsoleEntry {
  id: number;
  level: ConsoleLogLevel;
  args: string[];
  timestamp: string;
}

export interface Weblab2ConsoleState {
  logs: ConsoleEntry[];
  nextId: number;
}

const initialState: Weblab2ConsoleState = {
  logs: [],
  nextId: 0,
};

const consoleSlice = createSlice({
  name: 'console',
  initialState,
  reducers: {
    addConsoleLog: (
      state,
      action: PayloadAction<{level: ConsoleLogLevel; args: string[]}>
    ) => {
      state.logs.push({
        id: state.nextId,
        level: action.payload.level,
        args: action.payload.args,
        timestamp: new Date().toISOString(),
      });
      state.nextId++;
    },
    clearConsoleLogs: state => {
      state.logs = [];
    },
  },
});

registerReducers({weblab2Console: consoleSlice.reducer});

export const {addConsoleLog, clearConsoleLogs} = consoleSlice.actions;

export default consoleSlice.reducer;
