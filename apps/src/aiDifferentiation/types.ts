import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

export type ChatChoice = {
  selected: boolean;
  text: string;
};

export type ChatTextMessage = {
  role: Role;
  chatMessageText: string;
  status: string;
};

export type ChatItem = ChatTextMessage | ChatChoice[];
