import {ChatCompletionMessage} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';

export async function openaiCompletion(
  chatMessages: ChatCompletionMessage[]
): Promise<Response> {
  console.log('formatted for chat completion controller');
  const payload = {messages: formatForChatCompletion(chatMessages)};
  console.log(payload);
  // Send request to chat completion backend controller.
  const url = '/openai/chat_completion';
  return HttpClient.post(url, JSON.stringify({payload}), true);
}

const formatForChatCompletion = (chatMessages: ChatCompletionMessage[]) => {
  return chatMessages.map(message => {
    return {role: message.role, content: message.chatMessageText};
  });
};
