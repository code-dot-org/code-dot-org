import {createAsyncThunk} from '@reduxjs/toolkit';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {RootState} from '@cdo/apps/types/redux';

import {getUserChatHistory} from '../../aichatApi';
import {setOwnChatHistory, setStudentChatHistory} from '../slice';

interface FetchUserChatHistoryParams {
  userId: number;
  isOwnHistory: boolean;
  channelId?: string;
}

// This thunk's callback function submits a user id (either a teacher or student)
// along with the level/script id to the chat history endpoint,
// waits for a response, and then returns the user's chat events for that level/script.
export const fetchUserChatHistory = createAsyncThunk(
  'aichat/fetchUserChatHistory',
  async (
    {userId, isOwnHistory, channelId}: FetchUserChatHistoryParams,
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    // Post teacher's student's user id to backend and retrieve student's chat history.
    try {
      const chatHistoryApiResponse = await getUserChatHistory(
        userId,
        parseInt(state.progress.currentLevelId || ''),
        state.progress.scriptId,
        channelId
      );

      if (isOwnHistory) {
        thunkAPI.dispatch(setOwnChatHistory(chatHistoryApiResponse));
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
