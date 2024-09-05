import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotIcon from '@cdo/static/aichat/ai-bot-icon.svg';

import {Role} from './types';

import moduleStyles from './chat-message.module.scss';

interface ChatMessageProps {
  chatMessageText: string;
  role: Role;
  status: string;
  showProfaneUserMessageToggle?: boolean;
}

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  chatMessageText,
  role,
  status,
  showProfaneUserMessageToggle,
}) => {
  const [showProfaneUserMessage, setShowProfaneUserMessage] = useState(false);

  const hasDangerStyle =
    status === Status.PROFANITY_VIOLATION ||
    (role === Role.ASSISTANT && status === Status.ERROR);

  const hasWarningStyle = status === Status.PII_VIOLATION;

  const getDisplayText: string = useMemo(() => {
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
      case Status.ERROR:
        return role === Role.ASSISTANT
          ? commonI18n.aiChatResponseError()
          : chatMessageText;
      default:
        return '';
    }
  }, [chatMessageText, role, status, showProfaneUserMessage]);

  return (
    <>
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
          aria-label={
            role === Role.ASSISTANT ? 'AI bot' : 'User' + ' chat message'
          }
        >
          <SafeMarkdown markdown={getDisplayText} />
        </div>
      </div>
      {showProfaneUserMessageToggle &&
        role === Role.USER &&
        status === Status.PROFANITY_VIOLATION && (
          <div className={moduleStyles[`container-user`]}>
            <Button
              onClick={() => {
                setShowProfaneUserMessage(!showProfaneUserMessage);
              }}
              text={showProfaneUserMessage ? 'Hide message' : 'Show message'}
              size="xs"
              type="tertiary"
              className={moduleStyles.userProfaneMessageButton}
            />
          </div>
        )}
    </>
  );
};

export default ChatMessage;
