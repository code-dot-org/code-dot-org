import HttpClient from '@cdo/apps/util/HttpClient';

import {
  AiCustomizations,
  AichatContext,
  AichatModelCustomizations,
  ChatApiResponse,
  ChatMessage,
  ChatItem,
} from './types';

const CHAT_COMPLETION_URL = '/aichat/chat_completion';
const LOG_NOTIFICATIONS_URL = '/aichat/log_notifications';

/**
 * This function formats chat completion messages and aichat parameters, sends a POST request
 * to the aichat completion backend controller, then returns the status of the response
 * and assistant message if successful.
 */
export async function postAichatCompletionMessage(
  newMessage: ChatMessage,
  storedMessages: ChatItem[],
  aiCustomizations: AiCustomizations,
  aichatContext: AichatContext,
  sessionId?: number
): Promise<ChatApiResponse> {
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
 * This function formats aichat parameters, sends a POST request
 * to the aichat log notifications backend controller, then
 * returns the status of the response if successful.
 * This function is called when a user
 */
export async function postAichatLogNotifications(
  storedMessages: ChatItem[],
  aiCustomizations: AiCustomizations,
  aichatContext: AichatContext,
  sessionId?: number
): Promise<ChatApiResponse> {
  const aichatModelCustomizations: AichatModelCustomizations = {
    selectedModelId: aiCustomizations.selectedModelId,
    temperature: aiCustomizations.temperature,
    retrievalContexts: aiCustomizations.retrievalContexts,
    systemPrompt: aiCustomizations.systemPrompt,
  };
  const payload = {
    storedMessages,
    aichatModelCustomizations,
    aichatContext,
    ...(sessionId ? {sessionId} : {}),
  };
  const response = await HttpClient.post(
    LOG_NOTIFICATIONS_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return await response.json();
}
