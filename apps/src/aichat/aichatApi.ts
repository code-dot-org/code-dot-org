import HttpClient from '@cdo/apps/util/HttpClient';

import {
  AiCustomizations,
  AichatContext,
  AichatModelCustomizations,
  AichatCompletionApiResponse,
  LogAichatEventApiResponse,
  ChatMessage,
} from './types';

const CHAT_COMPLETION_URL = '/aichat/chat_completion';
const LOG_AICHAT_EVENT_URL = '/aichat/log_aichat_event';

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
): Promise<AichatCompletionApiResponse> {
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
export async function postLogAichatEvent(
  newAichatEvent: ChatMessage,
  aichatContext: AichatContext
): Promise<LogAichatEventApiResponse> {
  const payload = {
    newAichatEvent,
    aichatContext,
  };
  const response = await HttpClient.post(
    LOG_AICHAT_EVENT_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return await response.json();
}
