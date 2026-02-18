import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

export type ConsoleLogLevel = 'log' | 'warn' | 'error' | 'info';

export interface ConsoleEntry {
  level: ConsoleLogLevel;
  message: string;
  timestamp: string;
}

export interface Weblab2ConsoleState {
  logs: ConsoleEntry[];
}

const initialState: Weblab2ConsoleState = {
  logs: [],
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
        level: action.payload.level,
        message: action.payload.args.join(' '),
        timestamp: new Date().toISOString(),
      });
    },
    clearConsoleLogs: state => {
      state.logs = [];
    },
  },
});

registerReducers({weblab2Console: consoleSlice.reducer});

export const {addConsoleLog, clearConsoleLogs} = consoleSlice.actions;

export default consoleSlice.reducer;
