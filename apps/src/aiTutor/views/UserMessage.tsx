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

const INAPPROPRIATE_MESSAGE = 'This chat is inappropriate.';
const TOO_PERSONAL_MESSAGE = 'This chat is too personal.';
const ERROR_MESSAGE =
  'There was an error getting a response. Please try again.';

const statusToStyleMap = {
  [Status.OK]: style.userMessage,
  [Status.UNKNOWN]: style.userMessage,
  [Status.PROFANITY_VIOLATION]: style.inappropriateMessage,
  [Status.PII_VIOLATION]: style.tooPersonalMessage,
  [Status.ERROR]: style.errorMessage,
};

const getMessageText = (status: string, chatMessageText: string) => {
  switch (status) {
    case Status.PROFANITY_VIOLATION:
      return INAPPROPRIATE_MESSAGE;
    case Status.PII_VIOLATION:
      return TOO_PERSONAL_MESSAGE;
    case Status.ERROR:
      return ERROR_MESSAGE;
    default:
      return chatMessageText;
  }
};

const displayUserMessage = (status: string, chatMessageText: string) => {
  const className = statusToStyleMap[status];
  const messageText = getMessageText(status, chatMessageText);

  if (className && messageText) {
    return (
      <div className={classNames(style.message, className)}>{messageText}</div>
    );
  }
  return null;
};

const UserMessage: React.FC<UserMessageProps> = ({message}) => {
  return (
    <div id={`chat-message-id-${message.id}`}>
      <div className={style.userMessageContainer}>
        {displayUserMessage(message.status, message.chatMessageText)}
      </div>
    </div>
  );
};

export default UserMessage;
