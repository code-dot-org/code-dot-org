import HttpClient from '@cdo/apps/util/HttpClient';

import {
  AiCustomizations,
  AichatContext,
  AichatModelCustomizations,
  ChatApiResponse,
  ChatMessage,
  AichatEvent,
  StudentChatHistoryApiResponse,
} from './types';

const CHAT_COMPLETION_URL = '/aichat/chat_completion';
const STUDENT_CHAT_HISTORY_URL = '/aichat/student_chat_history';

/**
 * This function formats chat completion messages and aichatParameters, sends a POST request
 * to the aichat completion backend controller, then returns the status of the response
 * and assistant message if successful.
 */
export async function postAichatCompletionMessage(
  newMessage: ChatMessage,
  storedMessages: AichatEvent[],
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

export async function fetchAichatStudentChatHistory(
  studentUserId: number
): Promise<StudentChatHistoryApiResponse> {
  const payload = {
    studentUserId,
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
