import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './ai-tutor.module.scss';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';

const Role = {
  ASSISTANT: 'assistant',
  USER: 'user',
  SYSTEM: 'system',
};

const Status = {
  ERROR: 'error',
  INAPPROPRIATE: 'inappropriate',
  PROFANITY: 'profanity',
  OK: 'ok',
  PERSONAL: 'personal',
  UNKNOWN: 'unknown',
};

const INAPPROPRIATE_MESSAGE = 'This chat is inappropriate.';
const TOO_PERSONAL_MESSAGE = 'This chat is too personal.';

const isAssistant = role => {
  return role === Role.ASSISTANT;
};

const isUser = role => {
  return role === Role.USER;
};

const displayUserMessage = (status, chatMessageText) => {
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

const displayAssistantMessage = (status, chatMessageText) => {
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

const ChatMessage = ({message}) => {
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
          />
          {displayAssistantMessage(message.status, message.chatMessageText)}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number,
    role: PropTypes.string,
    status: PropTypes.string,
    chatMessageText: PropTypes.string,
  }),
};
