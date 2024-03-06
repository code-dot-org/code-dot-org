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

export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 2;
export const MAX_RETRIEVAL_CONTEXTS = 20;
export const MAX_ASK_ABOUT_TOPICS = 10;
