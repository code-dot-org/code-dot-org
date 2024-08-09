import HttpClient from '@cdo/apps/util/HttpClient';

import {
  AiCustomizations,
  AichatContext,
  AichatModelCustomizations,
  ChatCompletionApiResponse,
  ChatEvent,
  ChatMessage,
  LogChatEventApiResponse,
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

/**
 * This function sends a GET request to the aichat student chat history backend controller, then returns
 * a list of chat events (JSON) if successful.
 */
export async function getStudentChatHistory(
  studentUserId: number,
  levelId: number,
  scriptId: number | null,
  scriptLevelId: number | undefined
): Promise<string[]> {
  let params: Record<string, string> = {
    studentUserId: studentUserId.toString(),
    levelId: levelId.toString(),
    scriptId: scriptId?.toString() || '',
  };
  if (scriptLevelId) {
    params = {...params, scriptLevelId: scriptLevelId.toString()};
  }
  const urlParams = new URLSearchParams(params);
  const response = await HttpClient.get(
    STUDENT_CHAT_HISTORY_URL + '?' + new URLSearchParams(urlParams.toString()),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return await response.json();
}
