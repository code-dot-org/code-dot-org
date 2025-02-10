import {createAsyncThunk} from '@reduxjs/toolkit';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {RootState} from '@cdo/apps/types/redux';

import {getStudentChatHistory} from '../../aichatApi';
import {setStudentChatHistory} from '../slice';

// This thunk's callback function submits a teacher's student's id along with the level/script id
// (and the scriptLevelId if the level is a sublevel) to the student chat history endpoint,
// waits for a response, and then returns the student's chat events for that level/script.
export const fetchStudentChatHistory = createAsyncThunk(
  'aichat/fetchStudentChatHistory',
  async (studentUserId: number, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    // Post teacher's student's user id to backend and retrieve student's chat history.
    try {
      const studentChatHistoryApiResponse = await getStudentChatHistory(
        studentUserId,
        parseInt(state.progress.currentLevelId || ''),
        state.progress.scriptId
      );
      thunkAPI.dispatch(setStudentChatHistory(studentChatHistoryApiResponse));
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(
          'Error in aichat student chat history request',
          error as Error
        );
      return;
    }
  }
);
