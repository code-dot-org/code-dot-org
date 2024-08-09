import HttpClient from '@cdo/apps/util/HttpClient';

import {
  AiCustomizations,
  AichatContext,
  AichatModelCustomizations,
  ChatCompletionApiResponse,
  ChatEvent,
  ChatMessage,
  LogChatEventApiResponse,
  StudentChatHistoryApiResponse,
} from './types';

const CHAT_COMPLETION_URL = '/aichat/chat_completion';
const CHAT_CHECK_SAFETY_URL = '/aichat/check_message_safety';
const LOG_CHAT_EVENT_URL = '/aichat/log_chat_event';
const STUDENT_CHAT_HISTORY_URL = '/aichat/student_chat_history';

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
  sessionId?: number
): Promise<ChatCompletionApiResponse> {
  const aichatModelCustomizations: AichatModelCustomizations = {
    selectedModelId: aiCustomizations.selectedModelId,
    temperature: aiCustomizations.temperature,
    retrievalContexts: aiCustomizations.retrievalContexts,
    systemPrompt: aiCustomizations.systemPrompt,
  };
  const payload = {
    newMessage,
    storedMessages,
    aichatModelCustomizations,
    aichatContext,
    ...(sessionId ? {sessionId} : {}),
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

export async function postStudentChatHistory(
  studentUserId: number,
  currentLevelId: number,
  scriptId: number | null
): Promise<StudentChatHistoryApiResponse> {
  const payload = {
    studentUserId,
    currentLevelId,
    scriptId,
  };
  const response = await HttpClient.post(
    STUDENT_CHAT_HISTORY_URL,
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
