import React from 'react';
import classNames from 'classnames';
import style from './ai-tutor.module.scss';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import {Role, Status, ChatCompletionMessage} from '@cdo/apps/aiTutor/types';

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
  } else if (status === Status.PROFANITY) {
    return (
      <div className={classNames(style.message, style.inappropriateMessage)}>
        {INAPPROPRIATE_MESSAGE}
      </div>
    );
  } else if (status === Status.PERSONAL) {
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
          <Typography
            className={style.messageHeaderContainer}
            semanticTag="h5"
            visualAppearance="heading-xs"
          >
            ({message.role})
          </Typography>
          {displayAssistantMessage(message.status, message.chatMessageText)}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
