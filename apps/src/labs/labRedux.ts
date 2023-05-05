import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface LabState {
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
