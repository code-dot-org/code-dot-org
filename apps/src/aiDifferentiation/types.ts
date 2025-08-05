import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

import {ResponseValidator} from '../util/HttpClient';

export type ChatTextMessage = {
  role: Role;
  chatMessageText: string;
  status: string;
  id?: number;
};

export type ChatPrompt = {
  label: string;
  prompt: string;
  response?: string;
  followUpPrompts?: ChatPrompt[];
};

type ServerChatThread = {
  id: number;
  title: string;
  updated_at: Date;
  context_type: (typeof AiDiffContext)[keyof typeof AiDiffContext];
  messages?: [ChatItem];
};

export type ChatThread = {
  id: number;
  title: string;
  updatedAt: Date;
  contextType: (typeof AiDiffContext)[keyof typeof AiDiffContext];
  messages?: [ChatItem];
};

export type ChatItem = ChatTextMessage | ChatPrompt[];

export type Context = {
  type: (typeof AiDiffContext)[keyof typeof AiDiffContext];
  levelId?: number;
  lessonId?: number;
  unitId?: number;
  courseId?: number;
  viewAsUserId?: number;
};

const chatThreadValidator: ResponseValidator<ChatThread[]> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of chat events');
  }

  // Filter out threads that don't have a context defined
  const serverThreads = bodyJson.filter(
    thread => (thread as ServerChatThread).context_type !== null
  ) as ServerChatThread[];

  for (const serverThread of serverThreads) {
    if (serverThread.id === undefined) {
      throw Error('id');
    }
  }

  const threads: ChatThread[] = serverThreads.map(serverThread => {
    return {
      id: serverThread.id,
      title: serverThread.title,
      updatedAt: new Date(serverThread.updated_at),
      contextType: serverThread.context_type,
      messages: serverThread.messages,
    } as ChatThread;
  });

  return threads;
};

export {chatThreadValidator};
