import HttpClient from '@cdo/apps/util/HttpClient';
import {
  AiInteractionStatus,
  AiRequestExecutionStatus,
  AiChatReadTimeouts,
} from '@cdo/generated-scripts/sharedConstants';

import {Role} from '../aiComponentLibrary/chatMessage/types';
import {ValueOf} from '../types/utils';

import {chatHistoryValidator} from './api/validators';
import {
  AiCustomizations,
  AichatContext,
  ModelParameters,
  ChatEvent,
  DetectToxicityResponse,
  FeedbackValue,
  PendingChatMessage,
  ServerChatEvent,
  CompletedChatMessage,
} from './types';
import {extractFieldsToCheckForToxicity} from './utils';

const ROOT_GENERAL_URL = '/aichat';
const ROOT_REQUEST_URL = '/aichat_request';
const ROOT_EVENT_URL = '/aichat_events';
const paths = {
  START_CHAT_COMPLETION_URL: `${ROOT_REQUEST_URL}/start_chat_completion`,
  GET_CHAT_REQUEST_URL: `${ROOT_REQUEST_URL}/chat_request`,
  CHAT_COMPLETION_URL: `${ROOT_GENERAL_URL}/chat_completion`,
  LOG_CHAT_EVENT_URL: `${ROOT_EVENT_URL}/log_chat_event`,
  CHAT_HISTORY_URL: `${ROOT_EVENT_URL}/chat_history`,
  SUBMIT_TEACHER_FEEDBACK_URL: `${ROOT_EVENT_URL}/submit_teacher_feedback`,
  USER_HAS_AICHAT_ACCESS_URL: `${ROOT_GENERAL_URL}/user_has_access`,
  FIND_TOXICITY_URL: `${ROOT_GENERAL_URL}/find_toxicity`,
};

const MIN_POLLING_INTERVAL_MS = 1000;
const DEFAULT_BACKOFF_RATE = 1;

interface UserHasAichatAccessResponse {
  userHasAccess: boolean;
}

/**
 * @param eventId
 * @param feedback
 *
 * Sends a POST request to the aichat submit teacher feedback backend controller.
 */
export async function postSubmitTeacherFeedback(
  eventId: number,
  feedback: FeedbackValue | undefined
) {
  const payload = {
    eventId,
    feedback,
  };
  await HttpClient.post(
    `${paths.SUBMIT_TEACHER_FEEDBACK_URL}`,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
}

/**
 * This function sends a POST request to the aichat log event backend controller, then returns
 * the status of the response and logged event if successful.
 */
export async function postLogChatEvent(
  newChatEvent: ChatEvent,
  aichatContext: AichatContext
): Promise<ChatEvent> {
  const payload = {
    newChatEvent,
    aichatContext,
  };
  const response = await HttpClient.post(
    paths.LOG_CHAT_EVENT_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return await response.json();
}

/**
 * This function sends a GET request to the aichat student chat history backend controller, then returns
 * a list of chat events if successful.
 */
export async function getUserChatHistory(
  userId: number,
  levelId: number,
  scriptId: number | null,
  channelId?: string
): Promise<ServerChatEvent[]> {
  const params: Record<string, string> = {
    userId: userId.toString(),
    levelId: levelId.toString(),
    scriptId: scriptId?.toString() || '',
    channelId: channelId ?? '',
  };
  const response = await HttpClient.fetchJson<ServerChatEvent[]>(
    paths.CHAT_HISTORY_URL + '?' + new URLSearchParams(params),
    undefined,
    chatHistoryValidator
  );

  return response.value;
}

/**
 * Detects toxicity in the provided AI customizations by invoking the toxicity detection endpoint.
 * Returns a {@link DetectToxicityResponse}.
 */
export async function detectToxicityInCustomizations(
  aiCustomizations: AiCustomizations,
  levelId: number | null
): Promise<DetectToxicityResponse> {
  const response = await HttpClient.post(
    paths.FIND_TOXICITY_URL,
    JSON.stringify({
      ...extractFieldsToCheckForToxicity(aiCustomizations),
      levelId,
    }),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return (await response.json()) as DetectToxicityResponse;
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
 * This function formats chat completion messages and aichatParameters, sends a POST request
 * to the aichat completion backend controller, then returns the status of the response
 * and assistant message if successful.
 */
export async function postAichatCompletionMessage(
  newMessage: PendingChatMessage,
  storedMessages: CompletedChatMessage[],
  modelParameters: ModelParameters,
  aichatContext: AichatContext,
  maxPollingTimeMs?: number
): Promise<CompletedChatMessage[]> {
  const payload = {
    newMessage,
    storedMessages,
    modelParameters,
    aichatContext,
  };

  maxPollingTimeMs =
    maxPollingTimeMs || AiChatReadTimeouts[aichatContext.clientType] * 1500;

  const response = await HttpClient.post(
    paths.START_CHAT_COMPLETION_URL,
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
  const backoffRate = serverBackoffRate || DEFAULT_BACKOFF_RATE;

  let executionStatus: ValueOf<typeof AiRequestExecutionStatus> =
    AiRequestExecutionStatus.NOT_STARTED;
  let currentInterval = Math.max(pollingIntervalMs, MIN_POLLING_INTERVAL_MS);
  let modelResponse: string = '';

  // Poll for the chat completion request status. We will keep checking until the
  // request status is greater than RUNNING or QUEUED, or until we reach the max polling time.
  while (
    executionStatus < AiRequestExecutionStatus.SUCCESS &&
    Date.now() - startTime < maxPollingTimeMs
  ) {
    await new Promise(resolve => setTimeout(resolve, currentInterval));
    const chatResponse = await HttpClient.fetchJson<GetChatRequestResponse>(
      `${paths.GET_CHAT_REQUEST_URL}/${requestId}`
    );
    executionStatus = chatResponse.value.executionStatus;
    modelResponse = chatResponse.value.response;
    currentInterval *= backoffRate;
  }

  if (executionStatus < AiRequestExecutionStatus.SUCCESS) {
    // Timed out.
    throw new Error('Chat completion request timed out (client side)');
  }

  return getUpdatedMessages(newMessage, modelResponse, executionStatus).map(
    message => ({...message, requestId})
  );
}

/**
 * Get the updated user and assistant message based on the status of the chat completion request.
 * Returns a {@link CompletedChatMessage} without a request ID (added by the caller).
 */
function getUpdatedMessages(
  userMessage: PendingChatMessage,
  modelResponse: string,
  executionStatus: ValueOf<typeof AiRequestExecutionStatus>
) {
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
    case AiRequestExecutionStatus.MODEL_PROFANITY:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.ERROR,
        },
        {
          chatMessageText: modelResponse,
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.PROFANITY_VIOLATION,
        },
      ];
    case AiRequestExecutionStatus.FAILURE:
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
    case AiRequestExecutionStatus.USER_INPUT_TOO_LARGE:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.USER_INPUT_TOO_LARGE,
        },
        {
          chatMessageText: modelResponse,
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.USER_INPUT_TOO_LARGE,
        },
      ];
    case AiRequestExecutionStatus.MODEL_TIMEOUT:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.MODEL_TIMEOUT,
        },
        {
          chatMessageText: modelResponse, // Note that this message (and the ones above) are overwritten in the ChatMessageView component.
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.MODEL_TIMEOUT,
        },
      ];
    default:
      throw new Error(`Unexpected status: ${executionStatus}`);
  }
}

/**
 * This function sends a GET request to the aichat's userHasAichatAccess backend controller action,
 * then returns true if the user has aichat access and false otherwise.
 */
export async function getUserHasAichatAccess(): Promise<boolean> {
  const response = await HttpClient.fetchJson<UserHasAichatAccessResponse>(
    paths.USER_HAS_AICHAT_ACCESS_URL
  );
  return response.value.userHasAccess;
}
