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

export {initialChatMessages};
