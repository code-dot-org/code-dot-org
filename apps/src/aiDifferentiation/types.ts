import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

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

export type ChatItem = ChatTextMessage | ChatPrompt[];

export type Context = {
  type: (typeof AiDiffContext)[keyof typeof AiDiffContext];
  levelId?: number;
  lessonId?: number;
  unitId?: number;
  courseId?: number;
  viewAsUserId?: number;
};
