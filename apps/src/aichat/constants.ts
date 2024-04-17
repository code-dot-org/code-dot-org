import {
  ChatCompletionMessage,
  Role,
  AichatInteractionStatus as Status,
  ModelDescription,
} from './types';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

export const initialChatMessages: ChatCompletionMessage[] = [
  {
    id: 1,
    role: Role.ASSISTANT,
    chatMessageText:
      'Welcome to AI Chat! I am your assistant - please ask me questions according to the instructions given.',
    status: Status.OK,
  },
];

export const modelDescriptions: ModelDescription[] = modelsJson;
