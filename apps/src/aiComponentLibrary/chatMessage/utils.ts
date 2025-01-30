import {commonI18n} from '@cdo/apps/types/locale';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {Role} from './types';

export const getChatMessageDisplayText = (
  status: string,
  role: Role,
  chatMessageText: string,
  showProfaneUserMessage: boolean
): string => {
  switch (status) {
    case Status.OK:
    case Status.UNKNOWN:
      return chatMessageText;
    case Status.PROFANITY_VIOLATION:
      if (role === Role.ASSISTANT) {
        return commonI18n.aiChatInappropriateModelMessage();
      }

      return role === Role.USER && showProfaneUserMessage
        ? chatMessageText
        : commonI18n.aiChatInappropriateUserMessage();
    case Status.PII_VIOLATION:
      return commonI18n.aiChatTooPersonalUserMessage();
    case Status.USER_INPUT_TOO_LARGE:
      return role === Role.ASSISTANT
        ? commonI18n.aiChatUserInputTooLargeMessage()
        : chatMessageText;
    case Status.ERROR:
      return role === Role.ASSISTANT
        ? commonI18n.aiChatResponseError()
        : chatMessageText;
    default:
      return '';
  }
};
