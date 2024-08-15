import classNames from 'classnames';
import React from 'react';

import {
  ChatCompletionMessage,
  AITutorInteractionStatus as Status,
  Role,
} from '@cdo/apps/aiTutor/types';
import AssistantMessageFeedback from '@cdo/apps/aiTutor/views/AssistantMessageFeedback';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import style from './ai-differentiation.module.scss';

interface ChatMessageProps {
  message: ChatCompletionMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({message}) => {
  const shouldRenderFeedbackButtons =
    message.id &&
    message.role === Role.ASSISTANT &&
    message.status !== Status.ERROR &&
    message.status !== Status.PROFANITY_VIOLATION &&
    message.status !== Status.PII_VIOLATION;

  return (
    <>
      <div
        className={classNames(
          style.chatMessageContainer,
          style[`chatMessage${message.role}`]
        )}
      >
        <div className={style.chatMessageIcon}>
          {message.role === Role.ASSISTANT && (
            <img
              src={aiBotOutlineIcon}
              className={style.aiBotOutlineIcon}
              alt={commonI18n.aiTeachingAssistant()}
            />
          )}
        </div>

        <div
          id={'chat-workspace-message-body'}
          className={style.chatMessageBody}
        >
          <SafeMarkdown markdown={message.chatMessageText} />
        </div>
      </div>
      <div>
        {shouldRenderFeedbackButtons && (
          <AssistantMessageFeedback messageId={message.id} />
        )}
      </div>
    </>
  );
};

export default ChatMessage;
