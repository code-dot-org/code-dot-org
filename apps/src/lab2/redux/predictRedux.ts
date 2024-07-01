import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface PredictState {
  predictResponse: string;
  hasSubmittedResponse: boolean;
}

const initialState: PredictState = {
  predictResponse: '',
  hasSubmittedResponse: false,
};

// REDUCER
const predictSlice = createSlice({
  name: 'predict',
  initialState,
  reducers: {
    setPredictResponse(state, action: PayloadAction<string>) {
      state.predictResponse = action.payload;
    },
    setHasSubmittedResponse(state, action: PayloadAction<boolean>) {
      state.hasSubmittedResponse = action.payload;
    },
  },
});

export const {setPredictResponse, setHasSubmittedResponse} =
  predictSlice.actions;

export default predictSlice.reducer;
