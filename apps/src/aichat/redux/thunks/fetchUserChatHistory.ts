import {createAsyncThunk} from '@reduxjs/toolkit';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {getUserChatHistory} from '../../aichatApi';
import {setOwnChatHistory, setStudentChatHistory} from '../slice';
import {getNewRemoveId} from '../utils';

import {addChatEvent} from './addChatEvent';

interface FetchUserChatHistoryParams {
  userId: number;
  isOwnHistory: boolean;
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
      channelId,
      lessonId,
      initialWelcomeMessage,
    }: FetchUserChatHistoryParams,
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    // The level this history was requested for. Compare the raw id rather than
    // the parsed one below: NaN (no current level) never equals itself.
    const requestedLevelId = state.progress.currentLevelId;
    // Post teacher's student's user id to backend and retrieve student's chat history.
    try {
      const chatHistoryApiResponse = await getUserChatHistory(
        userId,
        parseInt(requestedLevelId || ''),
        state.progress.scriptId,
        channelId,
        lessonId
      );

      // Responses arrive in whatever order the server answers in. A fetch for
      // the level the user just left can land after the fetch for the level
      // they are on now, and setOwnChatHistory replaces the whole window --
      // which would seed the new level with the old level's messages, and send
      // them to the model as history on the next request.
      if (
        (thunkAPI.getState() as RootState).progress.currentLevelId !==
        requestedLevelId
      ) {
        return;
      }

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
