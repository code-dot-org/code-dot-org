import classNames from 'classnames';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotIcon from '@cdo/static/aichat/ai-bot-icon.svg';

import {Role} from './types';

import moduleStyles from './chat-message.module.scss';

function getDisplayText(chatMessageText: string, status: string, role: Role) {
  if (status === Status.OK || status === Status.UNKNOWN) {
    return chatMessageText;
  }

  if (status === Status.PROFANITY_VIOLATION) {
    return commonI18n.aiChatInappropriateUserMessage();
  }

  if (status === Status.PII_VIOLATION) {
    return commonI18n.aiChatTooPersonalUserMessage();
  }

  if (status === Status.ERROR) {
    return role === Role.ASSISTANT
      ? commonI18n.aiChatResponseError()
      : chatMessageText;
  }
}

interface ChatMessageProps {
  chatMessageText: string;
  role: Role;
  status: string;
}

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  chatMessageText,
  role,
  status,
}) => {
  // TODO: in teacher view, show option to view profane user message.
  const hasDangerStyle =
    status === Status.PROFANITY_VIOLATION ||
    (role === Role.ASSISTANT && status === Status.ERROR);

  const hasWarningStyle = status === Status.PII_VIOLATION;

  return (
    <div className={moduleStyles[`container-${role}`]}>
      {role === Role.ASSISTANT && (
        <div className={moduleStyles.botIconContainer}>
          <img
            src={aiBotIcon}
            alt={commonI18n.aiChatBotIconAlt()}
            className={moduleStyles.botIcon}
          />
        </div>
      )}
      <div
        className={classNames(
          moduleStyles[`message-${role}`],
          hasDangerStyle && moduleStyles.danger,
          hasWarningStyle && moduleStyles.warning
        )}
      >
        <SafeMarkdown
          markdown={getDisplayText(chatMessageText, status, role)}
        />
      </div>
    </div>
  );
};

export default ChatMessage;
