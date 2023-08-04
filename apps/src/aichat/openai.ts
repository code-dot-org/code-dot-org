import {ChatCompletionMessage} from './types';
import HttpClient from '@cdo/apps/util/HttpClient';

export async function openaiCompletion(
  chatMessages: ChatCompletionMessage[]
): Promise<Response> {
  const payload = {messages: formatForChatCompletion(chatMessages)};
  console.log('payload formatted for chat completion controller');
  console.log(payload);
  console.log(JSON.stringify(payload));
  // Send request to chat completion backend controller.
  const url = '/openai/chat_completion';
  return HttpClient.post(url, JSON.stringify(payload), true);
}

const formatForChatCompletion = (chatMessages: ChatCompletionMessage[]) => {
  return chatMessages.map(message => {
    return {role: message.role, content: message.chatMessageText};
  });
};
