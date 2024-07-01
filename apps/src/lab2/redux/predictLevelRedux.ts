import {sendPredictLevelReport} from '@cdo/apps/code-studio/progressRedux';
import {PayloadAction, createSelector, createSlice} from '@reduxjs/toolkit';
import {setLoadedPredictResponse} from '@cdo/apps/lab2/lab2Redux';
import {RootState} from '@cdo/apps/types/redux';

export interface PredictLevelState {
  response: string;
  hasSubmittedResponse: boolean;
}

const initialState: PredictLevelState = {
  // User's response for the level, if the level is a predict level. It is an empty string if this
  // is not a predict level or if the user has not yet submitted a response.
  response: '',
  hasSubmittedResponse: false,
};

// SELECTORS
// The predict answer is locked if the level is a predict level that does not allow multiple attempts
// and the user has not yet submitted a response.
export const isPredictAnswerLocked = createSelector(
  [
    (state: RootState) =>
      state.lab.levelProperties?.predictSettings?.allowMultipleAttempts,
    (state: RootState) => state.predictLevel.hasSubmittedResponse,
  ],
  (allowMultipleAttempts, hasSubmittedResponse) => {
    return !allowMultipleAttempts && hasSubmittedResponse;
  }
);

// REDUCER
const predictSlice = createSlice({
  name: 'predictLevel',
  initialState,
  reducers: {
    setPredictResponse(state, action: PayloadAction<string>) {
      state.response = action.payload;
    },
    setHasSubmittedPredictResponse(state, action: PayloadAction<boolean>) {
      state.hasSubmittedResponse = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(sendPredictLevelReport.fulfilled, state => {
      state.hasSubmittedResponse = true;
    });
    builder.addCase(setLoadedPredictResponse, (state, action) => {
      // We have loaded a predict response from the server.
      // If the response is not empty, we consider the user to have submitted a response.
      state.response = action.payload;
      state.hasSubmittedResponse = !!action.payload;
    });
  },
});

export const {setPredictResponse, setHasSubmittedPredictResponse} =
  predictSlice.actions;

export default predictSlice.reducer;
