import {createAsyncThunk} from '@reduxjs/toolkit';

import {
  clearChatMessagePending,
  clearStagedFiles,
  setChatMessagePending,
} from '@cdo/apps/aichat/redux/slice';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {TestResults} from '@cdo/apps/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {RootState} from '@cdo/apps/types/redux';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {postAichatCompletionMessage} from '../../aichatApi';
import {
  AichatContext,
  isCompletedChatMessage,
  PendingChatMessage,
  CompletedChatMessage,
  ChatAsset,
  ModelParameters,
  AiChatClientType,
} from '../../types';
import {getNewRemoveId} from '../utils';

import {addChatEvent} from './addChatEvent';
import {notifyErrorUnauthorized} from './helpers/notifyErrorUnauthorized';
import {sendAnalytics} from './sendAnalytics';

// This thunk's callback function submits a user's chat content and AI customizations to
// the chat completion endpoint, then waits for a chat completion response, and updates
// the user messages.
export const submitChatContents = createAsyncThunk(
  'aichat/submitChatContents',
  async (
    newUserMessageInput: {
      text: string;
      modelParameters: ModelParameters;
      clientType: AiChatClientType;
      hiddenContext?: string;
      assets?: ChatAsset[];
    },
    thunkAPI
  ) => {
    const dispatch = thunkAPI.dispatch as AppDispatch;
    const state = thunkAPI.getState() as RootState;
    const chatEventsCurrent = state.aichat.chatEventsCurrent;
    const {text, hiddenContext, assets, modelParameters, clientType} =
      newUserMessageInput;

    // Clear any staged files if present (used with multimodal models)
    thunkAPI.dispatch(clearStagedFiles());

    const aichatContext: AichatContext = {
      clientType,
      currentLevelId: parseInt(state.progress.currentLevelId || ''),
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
    };
    // Create the new user ChatCompleteMessage and add to chatMessages.
    const newUserMessage: PendingChatMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: text,
      hiddenContext,
      assets,
      timestamp: Date.now(),
    };
    dispatch(setChatMessagePending(newUserMessage));

    // Post user content and messages to backend and retrieve assistant response.
    const startTime = Date.now();

    let messages: CompletedChatMessage[] = [];
    try {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .incrementCounter('Aichat.ChatCompletionRequestInitiated');
      messages = await postAichatCompletionMessage(
        newUserMessage,
        chatEventsCurrent.filter(isCompletedChatMessage),
        modelParameters,
        aichatContext
      );

      const fileCount = newUserMessage.assets?.length || 0;
      const fileCountPdf =
        newUserMessage.assets?.filter(asset => asset.filename.endsWith('.pdf'))
          .length || 0;
      const fileCountImage = fileCount - fileCountPdf;
      dispatch(
        sendAnalytics(EVENTS.SUBMIT_AICHAT_REQUEST_SUCCESS, {
          levelPath: window.location.pathname,
          fileCount,
          fileCountImage,
          fileCountPdf,
        })
      );
    } catch (error) {
      await handleChatCompletionError(error as Error, newUserMessage, dispatch);
      return;
    }

    Lab2Registry.getInstance()
      .getMetricsReporter()
      .reportLoadTime('AichatModelResponseTime', Date.now() - startTime, [
        {
          name: 'ModelId',
          value: modelParameters.selectedModelId,
        },
      ]);

    thunkAPI.dispatch(clearChatMessagePending());
    // Send a report that the user has started the aichat level after successfully sending
    // a chat message and then receiving a response from the chatbot.
    // A teacher will view that the level is now in progress.
    dispatch(sendProgressReport('aichat', TestResults.LEVEL_STARTED));
    messages.forEach(message => {
      dispatch(addChatEvent(message));
    });
  }
);

async function handleChatCompletionError(
  error: Error,
  newUserMessage: PendingChatMessage,
  dispatch: AppDispatch
) {
  // Only send log report if not a 403 error.
  if (!(error instanceof NetworkError && error.response.status === 403)) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Error in aichat completion request', error as Error);
  }

  dispatch(clearChatMessagePending());
  dispatch(addChatEvent({...newUserMessage, status: Status.ERROR}));

  // Display specific error notifications if the user was rate limited (HTTP 429) or not authorized (HTTP 403).
  // Otherwise, display a generic error assistant response.
  if (error instanceof NetworkError && error.response.status === 429) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('Aichat.ChatCompletionErrorRateLimited');
    dispatch(
      addChatEvent({
        removeId: getNewRemoveId(),
        text: commonI18n.aiChatRateLimitError(),
        notificationType: 'error',
        timestamp: Date.now(),
      })
    );
  } else if (error instanceof NetworkError && error.response.status === 403) {
    await notifyErrorUnauthorized(error, 'Chat Completion', dispatch);
  } else {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('Aichat.ChatCompletionErrorUnhandled');
    dispatch(
      addChatEvent({
        role: Role.ASSISTANT,
        status: Status.ERROR,
        chatMessageText: 'error',
        timestamp: Date.now(),
      })
    );
  }
}
