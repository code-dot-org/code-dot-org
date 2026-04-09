import {createAsyncThunk} from '@reduxjs/toolkit';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {postAichatCompletionMessage} from '../../aichatApi';
import {AiChatClientType, AichatContext, ModelParameters} from '../../types';

import {addChatEvent} from './addChatEvent';

// Submits a hidden trigger message so the AI generates a greeting to open the
// conversation. The trigger message is not added to the visible chat history —
// only the assistant's response appears.
export const sendInitialGreeting = createAsyncThunk(
  'aichat/sendInitialGreeting',
  async (
    params: {
      hiddenContext: string;
      modelParameters: ModelParameters;
      clientType: AiChatClientType;
      lessonId?: number;
    },
    thunkAPI
  ) => {
    const dispatch = thunkAPI.dispatch as AppDispatch;
    const state = thunkAPI.getState() as RootState;
    const {hiddenContext, modelParameters, clientType, lessonId} = params;

    const aichatContext: AichatContext = {
      clientType,
      currentLevelId: parseInt(state.progress.currentLevelId || ''),
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
      lessonId,
    };

    // Minimal trigger — the real instruction is in hiddenContext.
    const triggerMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: 'Hello',
      hiddenContext,
      timestamp: Date.now(),
      updateId: createUuid(),
    } as const;

    try {
      const messages = await postAichatCompletionMessage(
        triggerMessage,
        [], // no prior history
        modelParameters,
        aichatContext
      );

      messages.forEach(message => {
        if (message.role === Role.ASSISTANT && message.status === Status.OK) {
          dispatch(addChatEvent(message));
        }
      });
    } catch {
      // Silently fail — the student can still use the chat without a greeting.
    }
  }
);
