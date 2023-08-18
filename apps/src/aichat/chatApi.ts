import {Role, Status, ChatCompletionMessage} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from './constants';
import Lab2MetricsReporter from '../lab2/Lab2MetricsReporter';
import DCDO from '@cdo/apps/dcdo';

/**
 * This function sends a POST request to the chat completion backend controller.
 */
async function postOpenaiChatCompletion(
  messagesToSend: OpenaiChatCompletionMessage[]
): Promise<OpenaiChatCompletionMessage | null> {
  const payload = {messages: messagesToSend};
  const callOpenaiChatCompletion = !!DCDO.get('chatapi', false);
  const response = callOpenaiChatCompletion
    ? await HttpClient.post(
        CHAT_COMPLETION_URL,
        JSON.stringify(payload),
        true,
        {
          'Content-Type': 'application/json; charset=UTF-8',
        }
      )
    : null;
  if (response?.ok) {
    return await response.json();
  } else {
    return null;
  }
}

const formatForChatCompletion = (
  chatMessages: ChatCompletionMessage[]
): OpenaiChatCompletionMessage[] => {
  return chatMessages.map(message => {
    return {role: message.role, content: message.chatMessageText};
  });
};

/**
 * This function formats chat completion messages including the system prompt, passes them
 * to `postOpenaiChatCompletion`, then returns the status of the response and assistant message if successful.
 */
export async function getChatCompletionMessage(
  systemPrompt: string,
  userMessageId: number,
  newMessage: string,
  chatMessages: ChatCompletionMessage[]
): Promise<ChatCompletionResponse> {
  const messagesToSend = [
    {role: Role.SYSTEM, content: systemPrompt},
    ...formatForChatCompletion(chatMessages),
    {role: Role.USER, content: newMessage},
  ];
  let response;
  try {
    response = await postOpenaiChatCompletion(messagesToSend);
  } catch (error) {
    Lab2MetricsReporter.logError(
      'Error in chat completion request',
      error as Error
    );
  }

  // For now, response will be null if there was an error.
  // TODO: If user message was inappropriate or too personal, update status accordingly.
  if (!response) {
    return {status: Status.PERSONAL, id: userMessageId}; // TODO: Update more accurately as either too personal or inappropriate.
  }
  return {
    status: Status.OK,
    id: userMessageId,
    assistantResponse: response.content,
  };
}

type OpenaiChatCompletionMessage = {role: string; content: string};
type ChatCompletionResponse = {
  status: Status;
  id: number;
  assistantResponse?: string;
};
