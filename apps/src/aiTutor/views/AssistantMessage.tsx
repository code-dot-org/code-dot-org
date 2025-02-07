import classNames from 'classnames';
import React from 'react';

import {
  ChatCompletionMessage,
  AITutorInteractionStatus as Status,
} from '@cdo/apps/aiTutor/types';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import AssistantMessageFeedback from './AssistantMessageFeedback';

import style from './chat-workspace.module.scss';

interface AssistantMessageProps {
  message: ChatCompletionMessage;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({message}) => {
  const shouldRenderFeedbackButtons =
    message.id &&
    message.status !== Status.ERROR &&
    message.status !== Status.PROFANITY_VIOLATION &&
    message.status !== Status.PII_VIOLATION;

  return (
    <div className={style.assistantMessageContainer}>
      <Typography semanticTag="h5" visualAppearance="heading-xs">
        AI Tutor ({message.role})
      </Typography>
      <div
        id={'chat-workspace-message-body'}
        className={classNames(style.message, style.assistantMessage)}
      >
        <SafeMarkdown
          markdown={message.chatMessageText}
          className={style.aiTutorMarkdown}
        />
      </div>
      {shouldRenderFeedbackButtons && (
        <AssistantMessageFeedback messageId={message.id} />
      )}
    </div>
  );
};

export default AssistantMessage;
