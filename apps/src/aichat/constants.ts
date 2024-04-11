export const CHAT_COMPLETION_URL = '/openai/chat_completion';
import {
  ChatCompletionMessage,
  Role,
  AITutorInteractionStatus as Status,
  ModelDescription,
} from './types';
import modelsJson from '../../static/aichat/modelDescriptions.json';

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

const models: ModelDescription[] = modelsJson as ModelDescription[];

export {models};
