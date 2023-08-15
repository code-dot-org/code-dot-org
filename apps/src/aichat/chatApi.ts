import {Role, Status, ChatCompletionMessage} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from './constants';

/**
 * This function sends a POST request to the chat completion backend controller.
 */
async function postOpenaiChatCompletion(
  payload: OpenaiChatCompletionMessage[]
): Promise<OpenaiChatCompletionMessage | null> {
  // Send request to chat completion backend controller.
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
 * This function formats the AI Chat conversation including the system prompt into the payload
 * and passes the payload to `postOpenaiChatCompletion`. It then receives the assistant chat response
 * and updates the chat completion user message status accordingly. It returns the user and assistant
 * chat completion messages.
 */
export async function getChatCompletionMessage(
  systemPrompt: string,
  lastMessageId: number,
  newMessage: string,
  chatMessages: ChatCompletionMessage[]
): Promise<ChatCompletionMessage[]> {
  const newChatMessage: ChatCompletionMessage = {
    id: lastMessageId + 1,
    name: Role.USER,
    role: Role.USER,
    status: Status.UNKNOWN,
    chatMessageText: newMessage,
  };

  const systemPromptMessage: ChatCompletionMessage = {
    id: 0,
    name: Role.SYSTEM,
    role: Role.SYSTEM,
    chatMessageText: systemPrompt,
    status: Status.OK,
  };
  const messagesToSend = [systemPromptMessage, ...chatMessages, newChatMessage];
  const payload = formatForChatCompletion(messagesToSend);
  const response = await postOpenaiChatCompletion(payload);

  // For now, response will be null if there was an error.
  // TODO: If user message was inappropriate or too personal, update status accordingly.
  if (!response) {
    newChatMessage.status = Status.INAPPROPRIATE; // TODO: Update status to be more accurate.
    return [newChatMessage];
  }
  // Response was successful, so update status of new message.
  newChatMessage.status = Status.OK;

  const assistantMessage = response.content;
  const assistantChatMessage: ChatCompletionMessage = {
    id: newChatMessage.id + 1,
    name: Role.ASSISTANT, // Will be reassigned in ChatWorkspace.tsx.
    role: Role.ASSISTANT,
    status: Status.OK,
    chatMessageText: assistantMessage,
  };
  return [newChatMessage, assistantChatMessage];
}

type OpenaiChatCompletionMessage = {role: string; content: string};
