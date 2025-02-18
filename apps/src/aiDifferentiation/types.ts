import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

export type ChatTextMessage = {
  role: Role;
  chatMessageText: string;
  status: string;
  id?: number;
};

export type ChatPrompt = {
  label: string;
  prompt: string;
};

export type ChatItem = ChatTextMessage | ChatPrompt[];
