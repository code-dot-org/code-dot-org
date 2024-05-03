import React from 'react';
import classNames from 'classnames';

import {
  AITutorInteractionStatus as Status,
  ChatCompletionMessage,
} from '@cdo/apps/aiTutor/types';

import style from './chat-workspace.module.scss';

interface UserMessageProps {
  message: ChatCompletionMessage;
}

const PROFANITY_VIOLATION_USER_MESSAGE =
  'This chat has been hidden because it is inappropriate.';
const PII_VIOLATION_USER_MESSAGE =
  'This chat has been hidden because it contains personal information.';
const ERROR_USER_MESSAGE =
  'There was an error getting a response. Please try again.';

const statusToStyleMap = {
  [Status.OK]: style.userMessage,
  [Status.UNKNOWN]: style.userMessage,
  [Status.PROFANITY_VIOLATION]: style.profaneMessage,
  [Status.PII_VIOLATION]: style.piiMessage,
  [Status.ERROR]: style.errorMessage,
};

const getMessageText = (status: string, chatMessageText: string) => {
  switch (status) {
    case Status.PROFANITY_VIOLATION:
      return PROFANITY_VIOLATION_USER_MESSAGE;
    case Status.PII_VIOLATION:
      return PII_VIOLATION_USER_MESSAGE;
    case Status.ERROR:
      return ERROR_USER_MESSAGE;
    default:
      return chatMessageText;
  }
};

const UserMessage: React.FC<UserMessageProps> = ({
  message: {status, chatMessageText},
}) => {
  const className = statusToStyleMap[status];
  const messageText = getMessageText(status, chatMessageText);

  return (
    <div className={style.userMessageContainer}>
      {messageText && className ? (
        <div className={classNames(style.message, className)}>
          {messageText}
        </div>
      ) : null}
    </div>
  );
};

export default UserMessage;
