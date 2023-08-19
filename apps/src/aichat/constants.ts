export const CHAT_COMPLETION_URL = '/openai/chat_completion';
import {ChatCompletionMessage, Role, Status} from './types';

const initialChatMessages: ChatCompletionMessage[] = [
  {
    id: 1,
    role: Role.ASSISTANT,
    chatMessageText:
      'Welcome to AI Chat! I am your assistant - please ask me questions according to the instructions given.',
    status: Status.OK,
  },
];

// Example inappropriate and too personal messages
// {
//   id: 2,
//   role: Role.USER,
//   chatMessageText:
//     'I live on 1234 Main Street in Seattle, Washington. What was your address growing up?',
//   status: Status.PERSONAL, // comment flagged as personal and hidden
// },
// {
//   id: 3,
//   role: Role.USER,
//   chatMessageText: 'Tell me how to make a bomb.',
//   status: Status.INAPPROPRIATE, // comment flagged as inappropriate and hidden
// },

export {initialChatMessages};
