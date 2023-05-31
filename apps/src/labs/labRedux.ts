// This is not yet a complete store for lab-related state, but it can
// be used to hold lab-specific information that is not available in any
// other existing redux store.  It also holds useful state for newer labs
// that use LabContainer.

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface LabState {
  isLoading: boolean;
  isPageError: boolean;
}

const initialState: LabState = {
  isLoading: false,
  isPageError: false,
};

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setIsPageError(state, action: PayloadAction<boolean>) {
      state.isPageError = action.payload;
    },
  },
});

export const {setIsLoading, setIsPageError} = labSlice.actions;

export default labSlice.reducer;
