import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export interface Lab2SystemState {
  loadingCodeEnvironment: boolean;
}

const initialState: Lab2SystemState = {
  loadingCodeEnvironment: false,
};

// SLICE
const systemSlice = createSlice({
  name: 'lab2System',
  initialState,
  reducers: {
    setLoadingCodeEnvironment(state, action: PayloadAction<boolean>) {
      state.loadingCodeEnvironment = action.payload;
    },
  },
});

export const {setLoadingCodeEnvironment} = systemSlice.actions;

export default systemSlice.reducer;
