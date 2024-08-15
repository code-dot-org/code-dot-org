import HttpClient from '@cdo/apps/util/HttpClient';
import {
  AiInteractionStatus,
  AiRequestExecutionStatus,
} from '@cdo/generated-scripts/sharedConstants';

import {Role} from '../aiComponentLibrary/chatMessage/types';
import {ValueOf} from '../types/utils';

import {
  AiCustomizations,
  AichatContext,
  AichatModelCustomizations,
  ChatCompletionApiResponse,
  LogChatEventApiResponse,
  ChatMessage,
  ChatEvent,
} from './types';

const ROOT_URL = '/aichat';
const CHAT_COMPLETION_URL = '/aichat/chat_completion';
const CHAT_CHECK_SAFETY_URL = '/aichat/check_message_safety';
const LOG_CHAT_EVENT_URL = '/aichat/log_chat_event';
const MAX_POLLING_TIME_MS = 45000;
const MIN_POLLING_INTERVAL_MS = 1000;

/**
 * This function formats chat completion messages and aichatParameters, sends a POST request
 * to the aichat completion backend controller, then returns the status of the response
 * and assistant message if successful.
 */
export async function postAichatCompletionMessage(
  newMessage: ChatMessage,
  storedMessages: ChatMessage[],
  aiCustomizations: AiCustomizations,
  aichatContext: AichatContext,
  useAsyncPolling = false,
  // Configurable for testing
  maxPollingTimeMs = MAX_POLLING_TIME_MS
): Promise<ChatCompletionApiResponse> {
  const aichatModelCustomizations: AichatModelCustomizations = {
    selectedModelId: aiCustomizations.selectedModelId,
    temperature: aiCustomizations.temperature,
    retrievalContexts: aiCustomizations.retrievalContexts,
    systemPrompt: aiCustomizations.systemPrompt,
  };

  if (useAsyncPolling) {
    return chatCompletionAsyncPolling(
      newMessage,
      storedMessages,
      aichatModelCustomizations,
      aichatContext,
      maxPollingTimeMs
    );
  }

  const payload = {
    newMessage,
    storedMessages,
    aichatModelCustomizations,
    aichatContext,
  };
  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return await response.json();
}

/**
 * This function sends a POST request to the aichat log event backend controller, then returns
 * the status of the response and logged event if successful.
 */
export async function postLogChatEvent(
  newChatEvent: ChatEvent,
  aichatContext: AichatContext
): Promise<LogChatEventApiResponse> {
  const payload = {
    newChatEvent,
    aichatContext,
  };
  const response = await HttpClient.post(
    LOG_CHAT_EVENT_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return await response.json();
}

interface LLMGuardResponseResult {
  body: string;
  statusCode: number;
}

interface LLMGuardResponse {
  result: LLMGuardResponseResult;
}

export async function postAichatCheckSafety(
  message: string
): Promise<LLMGuardResponse> {
  const payload = {
    message,
  };
  const response = await HttpClient.post(
    CHAT_CHECK_SAFETY_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return await response.json();
}

interface StartChatCompletionResponse {
  requestId: number;
  pollingIntervalMs: number;
  backoffRate: number;
}

export interface GetChatRequestResponse {
  executionStatus: ValueOf<typeof AiRequestExecutionStatus>;
  response: string;
}

/**
 * Perform chat completion by initiating an asynchronous request and polling for the response.
 */
async function chatCompletionAsyncPolling(
  newMessage: ChatMessage,
  storedMessages: ChatMessage[],
  aichatModelCustomizations: AichatModelCustomizations,
  aichatContext: AichatContext,
  maxPollingTimeMs = MAX_POLLING_TIME_MS
): Promise<ChatCompletionApiResponse> {
  const payload = {
    newMessage,
    storedMessages,
    aichatModelCustomizations,
    aichatContext,
  };

  const response = await HttpClient.post(
    `${ROOT_URL}/start_chat_completion`,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  const {
    requestId,
    pollingIntervalMs,
    backoffRate: serverBackoffRate,
  } = (await response.json()) as StartChatCompletionResponse;

  const startTime = Date.now();
  const backoffRate = serverBackoffRate || 1; // In case the server doesn't return a backoff rate

  let executionStatus: ValueOf<typeof AiRequestExecutionStatus> =
    AiRequestExecutionStatus.NOT_STARTED;
  let currentInterval = Math.max(pollingIntervalMs, MIN_POLLING_INTERVAL_MS);
  let modelResponse: string = '';

  while (
    executionStatus < AiRequestExecutionStatus.SUCCESS &&
    Date.now() - startTime < maxPollingTimeMs
  ) {
    await new Promise(resolve => setTimeout(resolve, currentInterval));
    const chatResponse = await HttpClient.fetchJson<GetChatRequestResponse>(
      `${ROOT_URL}/chat_request/${requestId}`
    );
    executionStatus = chatResponse.value.executionStatus;
    modelResponse = chatResponse.value.response;
    currentInterval *= backoffRate;
  }

  if (executionStatus < AiRequestExecutionStatus.SUCCESS) {
    // Timed out
    throw new Error('Chat completion request timed out');
  }

  return {
    messages: getUpdatedMessages(newMessage, modelResponse, executionStatus),
  };
}

/**
 * Get the updated user and assistant message based on the status of the chat completion request.
 */
function getUpdatedMessages(
  userMessage: ChatMessage,
  modelResponse: string,
  executionStatus: ValueOf<typeof AiRequestExecutionStatus>
): ChatMessage[] {
  switch (executionStatus) {
    case AiRequestExecutionStatus.SUCCESS:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.OK,
        },
        {
          chatMessageText: modelResponse,
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.OK,
        },
      ];
    case AiRequestExecutionStatus.USER_PROFANITY:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.PROFANITY_VIOLATION,
        },
      ];
    case AiRequestExecutionStatus.USER_PII:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.PII_VIOLATION,
        },
      ];
    case AiRequestExecutionStatus.FAILURE:
    case AiRequestExecutionStatus.MODEL_PROFANITY:
    case AiRequestExecutionStatus.MODEL_PII:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.ERROR,
        },
        {
          chatMessageText: modelResponse,
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.ERROR,
        },
      ];
    default:
      throw new Error(`Unexpected status: ${executionStatus}`);
  }
}
