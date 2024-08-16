import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export interface Lab2SystemState {
  loadingCodeEnvironment: boolean;
  isRunning: boolean;
}

const initialState: Lab2SystemState = {
  loadingCodeEnvironment: false,
  isRunning: false,
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
  },
});

export const {setLoadingCodeEnvironment, setIsRunning} = systemSlice.actions;

export default systemSlice.reducer;
