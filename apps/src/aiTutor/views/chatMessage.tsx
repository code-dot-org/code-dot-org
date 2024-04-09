import React from 'react';
import classNames from 'classnames';
import style from './chat-workspace.module.scss';
import {
  Role,
  AITutorInteractionStatus as Status,
  ChatCompletionMessage,
} from '@cdo/apps/aiTutor/types';

interface ChatMessageProps {
  message: ChatCompletionMessage;
}

const INAPPROPRIATE_MESSAGE = 'This chat is inappropriate.';
const TOO_PERSONAL_MESSAGE = 'This chat is too personal.';

const isAssistant = (role: string) => {
  return role === Role.ASSISTANT;
};

const isUser = (role: string) => {
  return role === Role.USER;
};

const displayUserMessage = (status: string, chatMessageText: string) => {
  if (status === Status.OK || status === Status.UNKNOWN) {
    return (
      <div className={classNames(style.message, style.userMessage)}>
        {chatMessageText}
      </div>
    );
  } else if (status === Status.PROFANITY_VIOLATION) {
    return (
      <div className={classNames(style.message, style.inappropriateMessage)}>
        {INAPPROPRIATE_MESSAGE}
      </div>
    );
  } else if (status === Status.PII_VIOLATION) {
    return (
      <div className={classNames(style.message, style.tooPersonalMessage)}>
        {TOO_PERSONAL_MESSAGE}
      </div>
    );
  } else if (status === Status.ERROR) {
    return (
      <div className={classNames(style.message, style.tooPersonalMessage)}>
        {'There was an error getting a response. Please try again.'}
      </div>
    );
  } else {
    return null;
  }
};

const displayAssistantMessage = (status: string, chatMessageText: string) => {
  if (status === Status.OK) {
    return (
      <div
        id={'chat-workspace-message-body'}
        className={classNames(style.message, style.assistantMessage)}
      >
        {chatMessageText}
      </div>
    );
  }
};

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({message}) => {
  return (
    <div id={`chat-message-id-${message.id}`}>
      {isUser(message.role) && (
        <div className={style.userMessageContainer}>
          {displayUserMessage(message.status, message.chatMessageText)}
        </div>
      )}

      {isAssistant(message.role) && (
        <div className={style.assistantMessageContainer}>
          {displayAssistantMessage(message.status, message.chatMessageText)}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
