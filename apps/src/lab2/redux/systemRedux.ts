import {PayloadAction, createSlice} from '@reduxjs/toolkit';

// This slice represents the state of the system lifecycle, including loading the
// coding environment and if the user's program is running. Individual labs are
// responsible for setting this state as needed (some labs may not care about these
// states, and therefore may not set these values).
export interface Lab2SystemState {
  loadedCodeEnvironment: boolean;
  codeEnvironmentError: string | null;
  isRunning: boolean;
  hasRun: boolean;
  isValidating: boolean;
  hasValidated: boolean;
  hasError: boolean;
}

const initialState: Lab2SystemState = {
  loadedCodeEnvironment: false,
  codeEnvironmentError: null,
  isRunning: false,
  hasRun: false,
  isValidating: false,
  hasValidated: false,
  hasError: false,
};

// SLICE
const systemSlice = createSlice({
  name: 'lab2System',
  initialState,
  reducers: {
    setLoadedCodeEnvironment(state, action: PayloadAction<boolean>) {
      state.loadedCodeEnvironment = action.payload;
    },
    setCodeEnvironmentError(state, action: PayloadAction<string | null>) {
      state.codeEnvironmentError = action.payload;
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
    setHasValidated(state, action: PayloadAction<boolean>) {
      state.hasValidated = action.payload;
    },
    setHasError(state, action: PayloadAction<boolean>) {
      state.hasError = action.payload;
    },
  },
});

export const {
  setLoadedCodeEnvironment,
  setCodeEnvironmentError,
  setIsRunning,
  setHasRun,
  setIsValidating,
  setHasValidated,
  setHasError,
} = systemSlice.actions;

export default systemSlice.reducer;
