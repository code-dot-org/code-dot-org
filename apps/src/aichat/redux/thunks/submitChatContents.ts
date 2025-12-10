import {createAsyncThunk} from '@reduxjs/toolkit';

import {
  clearChatMessagePending,
  clearStagedFiles,
  clearUserAddedSelectionContext,
  addEventToChatEventsCurrent,
  updateChatEvent,
  setChatMessagePending,
} from '@cdo/apps/aichat/redux/slice';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {TestResults} from '@cdo/apps/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {RootState} from '@cdo/apps/types/redux';
import experiments from '@cdo/apps/util/experiments';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {postAichatCompletionMessage} from '../../aichatApi';
import ChatEventLogger from '../../chatEventLogger';
import {formatUserAddedSelectionContextForPrompt} from '../../helpers/userAddedSelectionContextFormatter';
import {
  AichatContext,
  isCompletedChatMessage,
  PendingChatMessage,
  CompletedChatMessage,
  ChatAsset,
  ModelParameters,
  AnalyticsProperties,
  UserAddedSelectionContextItem,
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
      analyticsProperties?: AnalyticsProperties;
      userAddedSelectionContext?: UserAddedSelectionContextItem[];
      responseCallback?: (response: string) => string;
      logLevelActivity?: () => void;
    },
    thunkAPI
  ) => {
    const dispatch = thunkAPI.dispatch as AppDispatch;
    const state = thunkAPI.getState() as RootState;
    const chatEventsCurrent = state.aichat.chatEventsCurrent;
    const {
      text,
      hiddenContext,
      assets,
      modelParameters,
      clientType,
      analyticsProperties,
      userAddedSelectionContext,
      responseCallback,
      logLevelActivity,
    } = newUserMessageInput;

    // Clear any staged files if present (used with multimodal models)
    thunkAPI.dispatch(clearStagedFiles());
    // Clear any user added context if present.
    thunkAPI.dispatch(clearUserAddedSelectionContext());

    const aichatContext: AichatContext = {
      clientType,
      currentLevelId: parseInt(state.progress.currentLevelId || ''),
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
    };

    // Default to just sending `chatMessageText`, in case display text is the same as text to send to the model.
    let chatMessageText = text;
    let chatMessageDisplayText;

    // If we have userAddedSelectionContext, display text and text to send to the model will be different.
    if (userAddedSelectionContext?.length) {
      // Add the user added selections to the text to send to the model.
      chatMessageText +=
        '\n\n' +
        formatUserAddedSelectionContextForPrompt(userAddedSelectionContext);
      // And use the original message for the display.
      chatMessageDisplayText = text;
    }

    // Create the new user ChatCompleteMessage and add to chatMessages.
    const newUserMessage: PendingChatMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText,
      chatMessageDisplayText,
      hiddenContext,
      assets,
      userAddedSelectionContext,
      timestamp: Date.now(),
    };
    dispatch(setChatMessagePending(newUserMessage));
    if (logLevelActivity) {
      logLevelActivity();
    }

    // Post user content and messages to backend and retrieve assistant response.
    const startTime = Date.now();

    let messages: CompletedChatMessage[] = [];
    const projectFileCount =
      newUserMessage.userAddedSelectionContext?.length || 0;
    const projectFileCountHtml =
      newUserMessage.userAddedSelectionContext?.filter(file =>
        file.filename.endsWith('.html')
      ).length || 0;
    const projectFileCountJs =
      newUserMessage.userAddedSelectionContext?.filter(file =>
        file.filename.endsWith('.js')
      ).length || 0;
    const projectFileCountCss =
      newUserMessage.userAddedSelectionContext?.filter(file =>
        file.filename.endsWith('.css')
      ).length || 0;
    const fileCount = newUserMessage.assets?.length || 0;
    const fileCountPdf =
      newUserMessage.assets?.filter(asset => asset.filename.endsWith('.pdf'))
        .length || 0;
    const fileCountImage = fileCount - fileCountPdf;

    const eventData = {
      fileCount,
      fileCountImage,
      fileCountPdf,
      projectFileCount,
      projectFileCountHtml,
      projectFileCountJs,
      projectFileCountCss,
      clientType,
      ...analyticsProperties,
    };

    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('Aichat.ChatCompletionRequestInitiated');
    dispatch(sendAnalytics(EVENTS.SUBMIT_AICHAT_REQUEST_INITIATED, eventData));

    const streamFlow = async () => {
      let streamingRequestId: number | undefined;
      let streamingText = '';

      try {
        messages = await postAichatCompletionMessage(
          newUserMessage,
          chatEventsCurrent.filter(isCompletedChatMessage),
          modelParameters,
          aichatContext,
          undefined,
          {
            onStart: requestIdFromServer => {
              streamingRequestId = requestIdFromServer;
              dispatch(clearChatMessagePending());
              dispatch(
                addEventToChatEventsCurrent({
                  ...newUserMessage,
                  requestId: streamingRequestId,
                })
              );
              dispatch(
                addEventToChatEventsCurrent({
                  role: Role.ASSISTANT,
                  status: Status.UNKNOWN,
                  chatMessageText: '',
                  timestamp: Date.now(),
                  requestId: streamingRequestId,
                })
              );
            },
            onDelta: delta => {
              streamingText += delta;
              if (!streamingRequestId) {
                return;
              }
              dispatch(
                updateChatEvent({
                  requestId: streamingRequestId,
                  text: streamingText,
                  role: Role.ASSISTANT,
                })
              );
            },
          }
        );
      } catch (error) {
        await handleChatCompletionError(
          error as Error,
          newUserMessage,
          dispatch
        );
        return;
      }

      const responseTime = Date.now() - startTime;
      dispatch(
        sendAnalytics(EVENTS.SUBMIT_AICHAT_REQUEST_SUCCESS, {
          ...eventData,
          responseTime,
        })
      );
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .reportLoadTime('AichatModelResponseTime', responseTime, [
          {
            name: 'ModelId',
            value: modelParameters.selectedModelId,
          },
        ]);

      if (streamingRequestId) {
        dispatch(
          updateChatEvent({
            requestId: streamingRequestId,
            status: Status.OK,
            text: streamingText,
            role: Role.ASSISTANT,
          })
        );
        dispatch(
          updateChatEvent({
            requestId: streamingRequestId,
            status: Status.OK,
            role: Role.USER,
          })
        );
      }
      dispatch(clearChatMessagePending());
      dispatch(sendProgressReport('aichat', TestResults.LEVEL_STARTED));
      messages.forEach(message =>
        ChatEventLogger.getInstance().logChatEvent(message)
      );
    };

    if (experiments.isEnabledAllowingQueryString('ai-chat-stream')) {
      return streamFlow();
    }

    try {
      messages = await postAichatCompletionMessage(
        newUserMessage,
        chatEventsCurrent.filter(isCompletedChatMessage),
        modelParameters,
        aichatContext
      );
    } catch (error) {
      await handleChatCompletionError(error as Error, newUserMessage, dispatch);
      return;
    }

    const responseTime = Date.now() - startTime;
    dispatch(
      sendAnalytics(EVENTS.SUBMIT_AICHAT_REQUEST_SUCCESS, {
        ...eventData,
        responseTime,
      })
    );
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .reportLoadTime('AichatModelResponseTime', responseTime, [
        {
          name: 'ModelId',
          value: modelParameters.selectedModelId,
        },
      ]);

    dispatch(clearChatMessagePending());
    // Send a report that the user has started the aichat level after successfully sending
    // a chat message and then receiving a response from the chatbot.
    // A teacher will view that the level is now in progress.
    dispatch(sendProgressReport('aichat', TestResults.LEVEL_STARTED));
    messages.forEach(message => {
      if (responseCallback && message.role === Role.ASSISTANT) {
        message.chatMessageText = responseCallback(message.chatMessageText);
      }
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
