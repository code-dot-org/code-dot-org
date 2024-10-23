import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {registerReducers} from '@cdo/apps/redux';

import {getSubmissionStatus} from './submitProjectApi';
export interface SubmitProjectState {
  showSubmitProjectDialog: boolean;
  submissionStatus: number | undefined;
}

const initialState: SubmitProjectState = {
  showSubmitProjectDialog: false,
  submissionStatus: undefined,
};

// This thunk's callback function submits a teacher's student's id along with the level/script id
// (and the scriptLevelId if the level is a sublevel) to the student chat history endpoint,
// waits for a response, and then returns the student's chat events for that level/script.
export const fetchSubmissionStatus = createAsyncThunk(
  'aichat/getSubmissionStatus',
  async (_, thunkAPI) => {
    try {
      const response = await getSubmissionStatus();
      console.log('response.status', response.status);
      thunkAPI.dispatch(setSubmissionStatus(response.status));
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
    setSubmissionStatus: (state, action: PayloadAction<number>) => {
      state.submissionStatus = action.payload;
    },
  },
});

registerReducers({submitProject: submitProjectSlice.reducer});
export const {setShowSubmitProjectDialog, setSubmissionStatus} =
  submitProjectSlice.actions;
