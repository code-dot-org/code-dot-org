import {ChatCompletionMessage, AiCustomizations} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

const CHAT_COMPLETION_URL = '/aichat/chat_completion';

/**
 * This function sends a POST request to the aichat completion backend controller.
 */

export async function postAichatCompletionMessage(
  aiCustomizations: AiCustomizations,
  newMessage: ChatCompletionMessage,
  storedMessages: ChatCompletionMessage[],
  levelId: number | undefined
): Promise<ChatCompletionMessage | null> {
  const payload = levelId
    ? {aiCustomizations, newMessage, storedMessages, levelId}
    : {aiCustomizations, newMessage, storedMessages};

  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  if (response.ok) {
    return await response.json();
  } else {
    return null;
  }
}

/**
 * This function formats chat completion messages including the system prompt, passes them
 * to `postAichatCompletion`, then returns the status of the response and assistant message
 * if successful.
 * TODO: Awaiting details on how to format input for endpoint.
 */
export async function getAichatCompletionMessage(
  aiCustomizations: AiCustomizations,
  newMessage: ChatCompletionMessage,
  storedMessages: ChatCompletionMessage[],
  levelId?: number
) {
  let response;
  try {
    response = await postAichatCompletionMessage(
      aiCustomizations,
      newMessage,
      storedMessages,
      levelId
    );
  } catch (error) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Error in aichat completion request', error as Error);
  }
  return response;
}
