import {createAsyncThunk} from '@reduxjs/toolkit';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {getUserChatHistory} from '../../aichatApi';
import {setOwnChatHistory, setStudentChatHistory} from '../slice';
import {getNewRemoveId} from '../utils';

import {addChatEvent} from './addChatEvent';

interface FetchUserChatHistoryParams {
  userId: number | null;
  isOwnHistory: boolean;
  // The level the chat belongs to. Defaults to the page's level.
  levelId?: number;
  channelId?: string;
  lessonId?: number;
  initialWelcomeMessage?: string;
}

// This thunk's callback function submits a user id (either a teacher or student)
// along with the level/script id to the chat history endpoint,
// waits for a response, and then returns the user's chat events for that level/script.
export const fetchUserChatHistory = createAsyncThunk(
  'aichat/fetchUserChatHistory',
  async (
    {
      userId,
      isOwnHistory,
      levelId,
      channelId,
      lessonId,
      initialWelcomeMessage,
    }: FetchUserChatHistoryParams,
    thunkAPI
  ) => {
    // A signed-out viewer has no history to fetch.
    if (!userId) return;
    const state = thunkAPI.getState() as RootState;
    // Post teacher's student's user id to backend and retrieve student's chat history.
    try {
      const chatHistoryApiResponse = await getUserChatHistory(
        userId,
        levelId ?? parseInt(state.progress.currentLevelId || ''),
        state.progress.scriptId,
        channelId,
        lessonId
      );

      if (isOwnHistory) {
        thunkAPI.dispatch(setOwnChatHistory(chatHistoryApiResponse));
        if (initialWelcomeMessage) {
          const stateAfter = thunkAPI.getState() as RootState;
          if (stateAfter.aichat.chatEventsCurrent.length === 0) {
            (thunkAPI.dispatch as AppDispatch)(
              addChatEvent({
                timestamp: Date.now(),
                removeId: getNewRemoveId(),
                text: initialWelcomeMessage,
                notificationType: 'welcomeMessage',
                includeInChatHistory: true,
              })
            );
          }
        }
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
