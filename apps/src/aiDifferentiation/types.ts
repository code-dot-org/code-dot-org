import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {SuggestedPrompt} from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';

export type ChatTextMessage = {
  role: Role;
  chatMessageText: string;
  status: string;
};

export type ChatItem = ChatTextMessage | SuggestedPrompt[];
