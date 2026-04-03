import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

export type ConsoleLogLevel = 'log' | 'warn' | 'error' | 'info';

export interface ConsoleEntry {
  level: ConsoleLogLevel;
  message: string;
  timestamp: string;
  count: number;
  groupKey: string;
}

export interface Weblab2ConsoleState {
  logs: ConsoleEntry[];
}

const initialState: Weblab2ConsoleState = {
  logs: [],
};

const MAX_LOG_ENTRIES = 500;

// Strips trailing filenames from messages like "Image not found: cat.png"
// so that resource errors with different filenames are grouped together.
const getGroupKey = (level: ConsoleLogLevel, message: string) => {
  return `${level}:${message.replace(/: [\w.-]+\.\w+$/, '')}`;
};

const consoleSlice = createSlice({
  name: 'console',
  initialState,
  reducers: {
    addConsoleLog: (
      state,
      action: PayloadAction<{level: ConsoleLogLevel; args: string[]}>
    ) => {
      const message = action.payload.args.join(' ');
      const groupKey = getGroupKey(action.payload.level, message);
      const existingIndex = state.logs.findIndex(
        log => log.groupKey === groupKey
      );
      if (existingIndex !== -1) {
        const existingLog = state.logs[existingIndex];
        existingLog.count += 1;
        existingLog.message = message;
        existingLog.timestamp = new Date().toLocaleTimeString();
        state.logs.splice(existingIndex, 1);
        state.logs.push(existingLog);
        return;
      }
      state.logs.push({
        level: action.payload.level,
        message,
        timestamp: new Date().toLocaleTimeString(),
        count: 1,
        groupKey,
      });
      // Cap length of console logs to MAX_LOG_ENTRIES entries.
      if (state.logs.length > MAX_LOG_ENTRIES) {
        state.logs.shift();
      }
    },
    clearConsoleLogs: state => {
      state.logs = [];
    },
  },
});

registerReducers({weblab2Console: consoleSlice.reducer});

export const {addConsoleLog, clearConsoleLogs} = consoleSlice.actions;

export default consoleSlice.reducer;
