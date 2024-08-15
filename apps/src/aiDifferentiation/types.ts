import {ChatCompletionMessage} from '@cdo/apps/aiTutor/types';

export type ChatChoice = {
  selected: boolean;
  text: string;
};

export type ChatItem = ChatCompletionMessage | ChatChoice[];
