import {
  Role,
  ChatCompletionMessage,
  AiCustomizations,
  ChatContext,
} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

const CHAT_COMPLETION_URL = '/aichat/chat_completion';

/**
 * This function sends a POST request to the aichat completion backend controller.
 */

export async function postAichatCompletionMessage(
  messagesToSend: AichatCompletionMessage[],
  temperature: number,
  chatContext: ChatContext
): Promise<AichatCompletionMessage | null> {
  const payload = {
    inputs: messagesToSend,
    temperature,
    chatContext,
  };
  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  // For now, response will be null if there was an error.
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
  storedMessages: ChatCompletionMessage[],
  chatContext: ChatContext
) {
  const {systemPrompt, temperature, retrievalContexts} = aiCustomizations;
  const messagesToSend = [
    {role: Role.SYSTEM, content: systemPrompt},
    ...formatRetrievalContextsForAichatCompletion(retrievalContexts),
    ...formatMessagesForAichatCompletion(storedMessages),
    {role: Role.USER, content: chatContext['userMessage']},
  ];
  let response;
  try {
    response = await postAichatCompletionMessage(
      messagesToSend,
      temperature,
      chatContext
    );
  } catch (error) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Error in aichat completion request', error as Error);
  }
  return response;
}

const formatRetrievalContextsForAichatCompletion = (
  retrievalContexts: string[]
): AichatCompletionMessage[] => {
  return retrievalContexts.map(context => {
    return {role: Role.USER, content: context};
  });
};

const formatMessagesForAichatCompletion = (
  chatMessages: ChatCompletionMessage[]
): AichatCompletionMessage[] => {
  return chatMessages.map(message => {
    return {role: message.role, content: message.chatMessageText};
  });
};

type AichatCompletionMessage = {
  role: Role;
  content: string;
};
