import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotIcon from '@cdo/static/aichat/ai-bot-icon.svg';

import {Role, ProfaneMessageViewToggle} from './types';

import moduleStyles from './chat-message.module.scss';

interface ChatMessageProps {
  chatMessageText: string;
  role: Role;
  status: string;
  isTeacherView?: boolean;
}

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  chatMessageText,
  role,
  status,
  isTeacherView,
}) => {
  const [profaneMessageViewToggle, setProfaneMessageViewToggle] = useState(
    ProfaneMessageViewToggle.VIEW
  );

  const hasDangerStyle =
    status === Status.PROFANITY_VIOLATION ||
    (role === Role.ASSISTANT && status === Status.ERROR);

  const hasWarningStyle = status === Status.PII_VIOLATION;

  const getDisplayText: string = useMemo(() => {
    if (status === Status.OK || status === Status.UNKNOWN) {
      return chatMessageText;
    }

    if (status === Status.PROFANITY_VIOLATION) {
      if (
        role === Role.USER &&
        profaneMessageViewToggle === ProfaneMessageViewToggle.HIDE
      ) {
        return chatMessageText;
      }
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

    return '';
  }, [chatMessageText, role, status, profaneMessageViewToggle]);

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
        >
          <SafeMarkdown markdown={getDisplayText} />
        </div>
      </div>
      {isTeacherView &&
        role === Role.USER &&
        status === Status.PROFANITY_VIOLATION && (
          <div className={moduleStyles[`container-user`]}>
            <Button
              onClick={() => {
                if (
                  profaneMessageViewToggle === ProfaneMessageViewToggle.VIEW
                ) {
                  setProfaneMessageViewToggle(ProfaneMessageViewToggle.HIDE);
                } else {
                  setProfaneMessageViewToggle(ProfaneMessageViewToggle.VIEW);
                }
              }}
              text={
                profaneMessageViewToggle === ProfaneMessageViewToggle.VIEW
                  ? 'View message'
                  : 'Hide message'
              }
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
