import {createAsyncThunk} from '@reduxjs/toolkit';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {RootState} from '@cdo/apps/types/redux';

import {getUserChatHistory} from '../../aichatApi';
import {setPersonalChatHistory, setStudentChatHistory} from '../slice';

interface FetchUserChatHistoryParams {
  userId: number;
  isOwnHistory: boolean;
}

// This thunk's callback function submits a teacher's student's id along with the level/script id
// to the student chat history endpoint, waits for a response,
// and then returns the student's chat events for that level/script.
export const fetchUserChatHistory = createAsyncThunk(
  'aichat/fetchUserChatHistory',
  async ({userId, isOwnHistory}: FetchUserChatHistoryParams, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    // Post teacher's student's user id to backend and retrieve student's chat history.
    try {
      const chatHistoryApiResponse = await getUserChatHistory(
        userId,
        parseInt(state.progress.currentLevelId || ''),
        state.progress.scriptId
      );

      if (isOwnHistory) {
        thunkAPI.dispatch(setPersonalChatHistory(chatHistoryApiResponse));
      } else {
        thunkAPI.dispatch(setStudentChatHistory(chatHistoryApiResponse));
      }
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Error in aichat chat history request', error as Error);
      return;
    }
  }
);
