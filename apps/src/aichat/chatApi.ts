import {
  Role,
  AITutorInteractionStatus as Status,
  AITutorInteractionStatusValue,
  AITutorTypesValue,
  ChatCompletionMessage,
} from '@cdo/apps/aiTutor/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from './constants';
import Lab2Registry from '../lab2/Lab2Registry';

/**
 * This function sends a POST request to the chat completion backend controller.
 */
export async function postOpenaiChatCompletion(
  messagesToSend: OpenaiChatCompletionMessage[],
  levelId?: number,
  tutorType?: AITutorTypesValue
): Promise<OpenaiChatCompletionMessage | null> {
  const payload = levelId
    ? {levelId: levelId, messages: messagesToSend, type: tutorType}
    : {messages: messagesToSend, type: tutorType};

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
  chatMessages: ChatCompletionMessage[],
  levelId?: number,
  tutorType?: AITutorTypesValue
): Promise<ChatCompletionResponse> {
  const messagesToSend = [
    {role: Role.SYSTEM, content: systemPrompt},
    ...formatForChatCompletion(chatMessages),
    {role: Role.USER, content: newMessage},
  ];
  let response;
  try {
    response = await postOpenaiChatCompletion(
      messagesToSend,
      levelId,
      tutorType
    );
  } catch (error) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Error in chat completion request', error as Error);
  }

  // For now, response will be null if there was an error.
  if (!response) {
    return {status: Status.ERROR, id: userMessageId};
  } else if (response?.status === Status.PROFANITY_VIOLATION) {
    return {
      status: Status.PROFANITY_VIOLATION,
      id: userMessageId,
      assistantResponse:
        "I can't respond because your message is inappropriate. Please don't use profanity.",
    };
  } else if (response?.status === Status.PII_VIOLATION) {
    return {
      status: Status.PII_VIOLATION,
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
  status?: AITutorInteractionStatusValue;
  role: Role;
  content: string;
};
type ChatCompletionResponse = {
  status: AITutorInteractionStatusValue;
  id: number;
  assistantResponse?: string;
};
