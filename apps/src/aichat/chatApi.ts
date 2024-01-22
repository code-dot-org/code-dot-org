import {Role, Status, ChatCompletionMessage, PII} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from './constants';
import Lab2Registry from '../lab2/Lab2Registry';

/**
 * This function sends a POST request to the chat completion backend controller.
 */
export async function postOpenaiChatCompletion(
  messagesToSend: OpenaiChatCompletionMessage[],
  levelId?: number
): Promise<OpenaiChatCompletionMessage | null> {
  const payload = levelId
    ? {levelId: levelId, messages: messagesToSend}
    : {messages: messagesToSend};

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
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Error in chat completion request', error as Error);
  }

  // For now, response will be null if there was an error.
  if (!response) {
    return {status: Status.ERROR, id: userMessageId};
  } else if (response.status === Status.PROFANITY) {
    return {
      status: Status.PROFANITY,
      id: userMessageId,
      assistantResponse:
        "I can't respond because your message is inappropriate. Please don't use profanity.",
    };
  } else if (response && response.status && PII.includes(response.status)) {
    return {
      status: Status.PERSONAL,
      id: userMessageId,
      assistantResponse: `I can't respond because your message is inappropriate. Please don't include personal information like your ${response.status}.`,
    };
  }
  return {
    status: Status.OK,
    id: userMessageId,
    assistantResponse: response.content,
  };
}

type OpenaiChatCompletionMessage = {
  status?: Status;
  role: string;
  content: string;
};
type ChatCompletionResponse = {
  status: Status;
  id: number;
  assistantResponse?: string;
};
