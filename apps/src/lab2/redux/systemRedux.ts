import {PayloadAction, createSlice} from '@reduxjs/toolkit';

// This slice represents the state of the system lifecycle, including loading the
// coding environment and if the user's program is running. Individual labs are
// responsible for setting this state as needed (some labs may not care about these
// states, and therefore may not set these values).
export interface Lab2SystemState {
  loadingCodeEnvironment: boolean;
  isRunning: boolean;
  hasRun: boolean;
  isValidating: boolean;
}

const initialState: Lab2SystemState = {
  loadingCodeEnvironment: false,
  isRunning: false,
  hasRun: false,
  isValidating: false,
};

// SLICE
const systemSlice = createSlice({
  name: 'lab2System',
  initialState,
  reducers: {
    setLoadingCodeEnvironment(state, action: PayloadAction<boolean>) {
      state.loadingCodeEnvironment = action.payload;
    },
    setIsRunning(state, action: PayloadAction<boolean>) {
      state.isRunning = action.payload;
    },
    setHasRun(state, action: PayloadAction<boolean>) {
      state.hasRun = action.payload;
    },
    setIsValidating(state, action: PayloadAction<boolean>) {
      state.isValidating = action.payload;
    },
  },
});

export const {
  setLoadingCodeEnvironment,
  setIsRunning,
  setHasRun,
  setIsValidating,
} = systemSlice.actions;

export default systemSlice.reducer;
