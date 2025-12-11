import {createAsyncThunk} from '@reduxjs/toolkit';

import {
  addEventToChatEventsCurrent,
  clearStagedFiles,
  clearUserAddedSelectionContext,
  setChatMessageSent,
  updateChatMessageStatus,
  updateChatMessageText,
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
import {createUuid} from '@cdo/apps/utils';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {postAichatCompletionMessage} from '../../aichatApi';
import {logChatEvent} from '../../helpers/logChatEvent';
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

    const isStreaming =
      experiments.isEnabledAllowingQueryString('ai-chat-stream') &&
      (modelParameters.selectedModelId.startsWith('gemini') ||
        modelParameters.selectedModelId.startsWith('gpt'));

    // Clear any staged files if present (used with multimodal models)
    dispatch(clearStagedFiles());
    // Clear any user added context if present.
    dispatch(clearUserAddedSelectionContext());

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

    // Create the new user ChatMessage and add to chatEventsCurrent.
    const newUserMessage: PendingChatMessage & {updateId: string} = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText,
      chatMessageDisplayText,
      hiddenContext,
      assets,
      userAddedSelectionContext,
      timestamp: Date.now(),
      updateId: createUuid(),
    };
    dispatch(addEventToChatEventsCurrent(newUserMessage));
    dispatch(setChatMessageSent(true));

    // Create the placeholder assistant ChatMessage used when streaming
    const newAssistantMessage: PendingChatMessage & {updateId: string} = {
      role: Role.ASSISTANT,
      status: Status.UNKNOWN,
      chatMessageText: '',
      timestamp: Date.now(),
      updateId: createUuid(),
    };

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

    try {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .incrementCounter('Aichat.ChatCompletionRequestInitiated');

      dispatch(
        sendAnalytics(EVENTS.SUBMIT_AICHAT_REQUEST_INITIATED, eventData)
      );

      let streamingText = '';
      let hasAddedAssistantMessage = false;

      messages = await postAichatCompletionMessage(
        newUserMessage,
        chatEventsCurrent.filter(isCompletedChatMessage),
        modelParameters,
        aichatContext,
        undefined,
        isStreaming
          ? {
              onDelta: delta => {
                streamingText += delta;
                if (hasAddedAssistantMessage) {
                  dispatch(
                    updateChatMessageText({
                      updateId: newAssistantMessage.updateId,
                      chatMessageText: streamingText,
                    })
                  );
                } else {
                  dispatch(
                    addEventToChatEventsCurrent({
                      ...newAssistantMessage,
                      chatMessageText: streamingText,
                    })
                  );
                }
                hasAddedAssistantMessage = true;
              },
            }
          : undefined
      );

      // In milliseconds
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
    } catch (error) {
      await handleChatCompletionError(
        error as Error,
        newUserMessage,
        dispatch,
        state.progress.viewAsUserId
      );
      return;
    }

    // Send a report that the user has started the aichat level after successfully sending
    // a chat message and then receiving a response from the chatbot.
    // A teacher will view that the level is now in progress.
    dispatch(sendProgressReport('aichat', TestResults.LEVEL_STARTED));
    messages.forEach(message => {
      if (message.role === Role.ASSISTANT) {
        message.chatMessageText =
          responseCallback?.(message.chatMessageText) ??
          message.chatMessageText;

        if (isStreaming) {
          dispatch(
            updateChatMessageStatus({
              updateId: newAssistantMessage.updateId,
              status: message.status,
            })
          );
          logChatEvent(message, state.progress.viewAsUserId);
        } else {
          dispatch(addChatEvent(message));
        }
      }
      if (message.role === Role.USER) {
        dispatch(
          updateChatMessageStatus({
            updateId: newUserMessage.updateId,
            status: message.status,
          })
        );
        logChatEvent(message, state.progress.viewAsUserId);
      }
    });
  }
);

async function handleChatCompletionError(
  error: Error,
  newUserMessage: PendingChatMessage & {updateId: string},
  dispatch: AppDispatch,
  viewAsUserId: number | null
) {
  // Only send log report if not a 403 error.
  if (!(error instanceof NetworkError && error.response.status === 403)) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Error in aichat completion request', error as Error);
  }

  dispatch(
    updateChatMessageStatus({
      updateId: newUserMessage.updateId,
      status: Status.ERROR,
    })
  );
  logChatEvent({...newUserMessage, status: Status.ERROR}, viewAsUserId);

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
