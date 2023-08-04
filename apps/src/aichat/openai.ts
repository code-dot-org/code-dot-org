import {ChatCompletionMessage} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';

export async function openaiCompletion(
  chatMessages: ChatCompletionMessage[]
): Promise<openaiResponse> {
  const payload = {messages: formatForChatCompletion(chatMessages)};
  // Send request to chat completion backend controller.
  const url = '/openai/chat_completion';
  const response = await HttpClient.post(url, JSON.stringify(payload), true, {
    'Content-Type': 'application/json; charset=UTF-8',
  });
  return await response.json();
}

const formatForChatCompletion = (chatMessages: ChatCompletionMessage[]) => {
  return chatMessages.map(message => {
    return {role: message.role, content: message.chatMessageText};
  });
};

type openaiResponse = {role: string; content: string};
