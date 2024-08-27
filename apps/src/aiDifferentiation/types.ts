import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

export type ChatTextMessage = {
  role: Role;
  chatMessageText: string;
  status: string;
};

export type ChatItem = ChatTextMessage | string[];
