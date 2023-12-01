export const CHAT_COMPLETION_URL = '/openai/chat_completion';
import {ChatCompletionMessage, Role, Status} from './types';

const initialChatMessages: ChatCompletionMessage[] = [
  {
    id: 1,
    role: Role.ASSISTANT,
    chatMessageText: "Hi! I'm your AI Tutor. Type your question below.",
    status: Status.OK,
  },
];

export {initialChatMessages};
