import {ChatCompletionMessage} from './types';

export const openaiCompletion = (chatMessages: ChatCompletionMessage[]) => {
  console.log(chatMessages);
  console.log('formatted for chat completion controller');
  const payload = formatForChatCompletion(chatMessages);
  console.log(payload);
  // Send request to chat completion backend controller.
};

const formatForChatCompletion = (chatMessages: ChatCompletionMessage[]) => {
  return chatMessages.map(message => {
    return {role: message.role, content: message.chatMessageText};
  });
};
