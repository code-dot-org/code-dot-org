import {createAsyncThunk} from '@reduxjs/toolkit';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  THREAD_TYPES,
  ThreadTypeFields,
  DEFAULT_THREAD_TITLE,
} from '@cdo/apps/aiDifferentiation/constants';
import {
  ChatPrompt,
  ChatThread,
  chatThreadMessagesValidator,
} from '@cdo/apps/aiDifferentiation/types';
import {RootState} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {
  setThreadId,
  setThreadTitle,
  setThreadType,
  setThreadMessages,
  setThreadKeyId,
  setInitialChatMessage,
  setInitialThreadPrompt,
  setSelectedPrompt,
} from '../slice';

interface FetchThreadMessagesParams {
  thread: number;
  threadType?: ThreadTypeFields;
  initialThreadPrompt?: ChatPrompt;
  suggestedPrompts?: ChatPrompt[];
}

async function asyncFetchThreadMessages(thread: number): Promise<ChatThread> {
  const response = await HttpClient.fetchJson<ChatThread>(
    `/aidiff_threads/${thread}`,
    {},
    chatThreadMessagesValidator
  );
  return response.value;
}

export const fetchThreadMessages = createAsyncThunk(
  'aichat/fetchThreadMessages',
  async (
    {
      thread,
      threadType = THREAD_TYPES.default,
      initialThreadPrompt,
      suggestedPrompts,
    }: FetchThreadMessagesParams,
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    thunkAPI.dispatch(setThreadType(threadType));

    if (thread === 0) {
      thunkAPI.dispatch(setThreadId(0));
      thunkAPI.dispatch(setThreadTitle(DEFAULT_THREAD_TITLE));
      thunkAPI.dispatch(setInitialChatMessage(threadType.initialMessage));
      thunkAPI.dispatch(setSelectedPrompt(null));

      if (initialThreadPrompt) {
        thunkAPI.dispatch(setInitialThreadPrompt(initialThreadPrompt));
        thunkAPI.dispatch(
          setThreadMessages([
            {
              role: Role.USER,
              chatMessageText: initialThreadPrompt.prompt,
              status: Status.OK,
            },
          ])
        );
      } else {
        const initialAIMessage = {
          role: Role.ASSISTANT,
          chatMessageText: threadType.initialMessage,
          status: Status.OK,
        };
        thunkAPI.dispatch(setInitialThreadPrompt(null));
        thunkAPI.dispatch(
          setThreadMessages(
            suggestedPrompts && threadType.showSuggestedPrompts
              ? [initialAIMessage, suggestedPrompts]
              : [initialAIMessage]
          )
        );
      }

      // changing the keyId resets the component state.
      // if key is already 0 (i.e. starting a new thread from a new thread)
      // then we need to alternate to a different key value to reset state
      // -1 is safe because it won't accidentally match a threadID value
      if (state.aichat.threadKeyId === 0) {
        thunkAPI.dispatch(setThreadKeyId(-1));
      } else {
        thunkAPI.dispatch(setThreadKeyId(thread));
      }
    } else {
      asyncFetchThreadMessages(thread).then(response => {
        thunkAPI.dispatch(setThreadMessages(response.messages || []));
        thunkAPI.dispatch(setThreadId(thread));
        thunkAPI.dispatch(setThreadTitle(response.title));
        thunkAPI.dispatch(setThreadKeyId(thread));
      });
    }
  }
);
