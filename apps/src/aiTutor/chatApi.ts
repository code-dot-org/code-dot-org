import {
  Role,
  AITutorInteractionStatus as Status,
  AITutorInteractionStatusValue,
  AITutorTypesValue,
  ChatCompletionMessage,
} from '@cdo/apps/aiTutor/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import Lab2Registry from '../lab2/Lab2Registry';

const CHAT_COMPLETION_URL = '/openai/chat_completion';

/**
 * This function sends a POST request to the chat completion backend controller.
 * Note: This function needs access to the tutorType so it can decide whether to include
 * validation code on the backend.
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
  formattedQuestion: string,
  chatMessages: ChatCompletionMessage[],
  levelId?: number,
  tutorType?: AITutorTypesValue
): Promise<ChatCompletionResponse> {
  const messagesToSend = [
    {role: Role.SYSTEM, content: systemPrompt},
    ...formatForChatCompletion(chatMessages),
    {role: Role.USER, content: formattedQuestion},
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
    return {status: Status.ERROR};
  } else if (response?.status === Status.PROFANITY_VIOLATION) {
    return {
      status: Status.PROFANITY_VIOLATION,
      assistantResponse:
        "I can't respond because your message is inappropriate. Please don't use profanity.",
    };
  } else if (response?.status === Status.PII_VIOLATION) {
    return {
      status: Status.PII_VIOLATION,
      assistantResponse: `I can't respond because your message is inappropriate. Please don't include personal information like your ${response.status}.`,
    };
  }
  return {
    status: Status.OK,
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
  assistantResponse?: string;
};
