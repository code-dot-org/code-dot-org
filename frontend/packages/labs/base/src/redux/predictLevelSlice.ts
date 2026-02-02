import {
  type PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import type {ApiClient, QueryClient} from '@code-dot-org/core/api';
import {levelsKeys} from '@code-dot-org/core/api';

import {progressActions} from '@code-dot-org/progress/redux';

import type {RootState, AppDispatch} from '../redux/store';

import {setLoadedPredictResponse} from './labSlice';

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
  {
    apiClient: ApiClient;
    queryClient: QueryClient;
    scriptId?: number;
    currentLevelId?: number;
    userId: number;
  },
  {dispatch: AppDispatch; state: RootState}
>('predictLevel/resetPredictProgress', async (payload, thunkAPI) => {
  try {
    const {apiClient, queryClient, currentLevelId, scriptId} = payload;

    apiClient.levels.resetPredictLevelProgress({
      currentLevelId,
      scriptId,
    });
    queryClient.invalidateQueries({
      queryKey: levelsKeys.all,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thunkAPI.dispatch<any>(
      progressActions.queryUserProgress(payload.userId.toString()),
    );
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const submitPredictResponse =
  ({appType}: {appType: string}) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const isPredictLevel = Boolean(
      state.lab.levelProperties?.predictSettings?.isPredictLevel,
    );
    const predictAnswerLocked = isPredictAnswerLocked(state);

    if (isPredictLevel && !predictAnswerLocked) {
      const predictResponse = state.predictLevel.response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch<any>(
        progressActions.sendPredictLevelReport({
          appType,
          predictResponse,
        }),
      );
    }
  };

// SELECTORS
export const isPredictResponseSubmitted = (state: RootState) =>
  state.predictLevel.hasSubmittedResponse;

// The predict answer is locked if the level does not allow multiple predict attempts
// and the user has already submitted a response.
export const isPredictAnswerLocked = createSelector(
  [
    (state: RootState) =>
      state.lab.levelProperties?.predictSettings?.allowMultipleAttempts,
    isPredictResponseSubmitted,
  ],
  (allowMultipleAttempts, hasSubmittedResponse) => {
    return !allowMultipleAttempts && hasSubmittedResponse;
  },
);

// REDUCER
const predictSlice = createSlice({
  name: 'predictLevel',
  initialState,
  reducers: {
    setPredictResponse(state, action: PayloadAction<string>) {
      state.response = action.payload;
    },
    setHasSubmittedResponse(state, action: PayloadAction<boolean>) {
      // Should only be used by unit tests.
      state.hasSubmittedResponse = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(progressActions.sendPredictLevelReport.fulfilled, state => {
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

export const {setPredictResponse, setHasSubmittedResponse} =
  predictSlice.actions;

export default predictSlice;
