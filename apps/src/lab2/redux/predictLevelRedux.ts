import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import {
  queryUserProgress,
  sendPredictLevelReport,
} from '@cdo/apps/code-studio/progressRedux';
import {setLoadedPredictResponse} from '@cdo/apps/lab2/lab2Redux';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {resetPredictLevelProgress} from '../projects/userLevelsApi';

export interface PredictLevelState {
  response: string;
  hasSubmittedResponse: boolean;
  resetFailed: boolean;
}

const initialState: PredictLevelState = {
  // User's response for the level, if the level is a predict level. It is an empty string if this
  // is not a predict level or if the user has not yet submitted a response.
  response: '',
  // If the user has submitted a predict response for the current level.
  hasSubmittedResponse: false,
  resetFailed: false,
};

// THUNKS
export const resetPredictProgress = createAsyncThunk<
  void,
  {scriptId: number | null; currentLevelId: string | null; userId: number},
  {dispatch: AppDispatch; state: RootState}
>('predictLevel/resetPredictProgress', async (payload, thunkAPI) => {
  try {
    const response = await resetPredictLevelProgress(
      payload.currentLevelId,
      payload.scriptId
    );
    if (response.ok) {
      thunkAPI.dispatch(queryUserProgress(payload.userId.toString()));
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

// SELECTORS

// The predict answer is locked if the level does not allow multiple predict attempts
// and the user has already submitted a response.
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
    builder.addCase(resetPredictProgress.fulfilled, state => {
      state.response = '';
      state.hasSubmittedResponse = false;
      state.resetFailed = false;
    });
    builder.addCase(resetPredictProgress.rejected, state => {
      state.resetFailed = true;
    });
    builder.addCase(resetPredictProgress.pending, state => {
      state.resetFailed = false;
    });
  },
});

export const {setPredictResponse} = predictSlice.actions;

export default predictSlice.reducer;
