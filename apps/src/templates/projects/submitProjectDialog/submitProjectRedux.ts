import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {registerReducers} from '@cdo/apps/redux';

import {getSubmissionStatus} from './submitProjectApi';
export interface SubmitProjectState {
  showSubmitProjectDialog: boolean;
  submissionStatus: string | undefined;
}

const initialState: SubmitProjectState = {
  showSubmitProjectDialog: false,
  submissionStatus: undefined,
};

// This thunk's callback function retrieves the proejct's submission status.
export const fetchSubmissionStatus = createAsyncThunk(
  'aichat/getSubmissionStatus',
  async (_, thunkAPI) => {
    try {
      const response = getSubmissionStatus();
      console.log('response', response);
      thunkAPI.dispatch(setSubmissionStatus('can_submit'));
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Error in project submission status request', error as Error);
      return;
    }
  }
);
const submitProjectSlice = createSlice({
  name: 'submitProject',
  initialState,
  reducers: {
    setShowSubmitProjectDialog: (state, action: PayloadAction<boolean>) => {
      state.showSubmitProjectDialog = action.payload;
    },
    setSubmissionStatus: (state, action: PayloadAction<string>) => {
      state.submissionStatus = action.payload;
    },
  },
});

registerReducers({submitProject: submitProjectSlice.reducer});
export const {setShowSubmitProjectDialog, setSubmissionStatus} =
  submitProjectSlice.actions;
