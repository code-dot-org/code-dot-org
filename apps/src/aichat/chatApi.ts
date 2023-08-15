import {ChatCompletionMessage} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {Role, Status} from './constants';

export async function postOpenaiChatCompletion(
  chatMessages: ChatCompletionMessage[]
): Promise<ChatCompletionResponse> {
  const payload = {messages: formatForChatCompletion(chatMessages)};
  // Send request to chat completion backend controller.
  const url = '/openai/chat_completion';
  const response = await HttpClient.post(url, JSON.stringify(payload), true, {
    'Content-Type': 'application/json; charset=UTF-8',
  });
  if (response.status === 200) {
    return await response.json();
  } else {
    return null;
  }
}

const formatForChatCompletion = (chatMessages: ChatCompletionMessage[]) => {
  return chatMessages.map(message => {
    return {role: message.role, content: message.chatMessageText};
  });
};

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
  const response = await postOpenaiChatCompletion(messagesToSend);

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

type ChatCompletionResponse = {role: string; content: string} | null;
