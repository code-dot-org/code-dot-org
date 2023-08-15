import React from 'react';
import moduleStyles from './chatMessage.module.scss';
import classNames from 'classnames';
import aichatI18n from '../locale';
import {ChatCompletionMessage, Role, Status} from '../types';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';

interface ChatMessageProps {
  message: ChatCompletionMessage;
}

const INAPPROPRIATE_MESSAGE = aichatI18n.inappropriateUserMessage();
const TOO_PERSONAL_MESSAGE = aichatI18n.tooPersonalUserMessage();
const EDUBOT_NAME = 'Edubot'; // TODO: Replace with name from levelbuilder.

const isAssistant = (role: string) => {
  return role === Role.ASSISTANT;
};

const isUser = (role: string) => {
  return role === Role.USER;
};

const displayUserMessage = (status: string, chatMessageText: string) => {
  if (status === Status.OK) {
    return (
      <div
        className={classNames(moduleStyles.message, moduleStyles.userMessage)}
      >
        {chatMessageText}
      </div>
    );
  } else if (status === 'inappropriate') {
    return (
      <div
        className={classNames(
          moduleStyles.message,
          moduleStyles.inappropriateMessage
        )}
      >
        {INAPPROPRIATE_MESSAGE}
      </div>
    );
  } else if (status === Status.PERSONAL) {
    return (
      <div
        className={classNames(
          moduleStyles.message,
          moduleStyles.tooPersonalMessage
        )}
      >
        {TOO_PERSONAL_MESSAGE}
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
        className={classNames(
          moduleStyles.message,
          moduleStyles.assistantMessage
        )}
      >
        {chatMessageText}
      </div>
    );
  }
};

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({message}) => {
  return (
    <div id={`ChatMessage id: ${message.id}`}>
      {isUser(message.role) && (
        <div className={moduleStyles.userMessageContainer}>
          {displayUserMessage(message.status, message.chatMessageText)}
        </div>
      )}

      {isAssistant(message.role) && (
        <div className={moduleStyles.assistantMessageContainer}>
          <Typography
            className={moduleStyles.messageHeaderContainer}
            semanticTag="h5"
            visualAppearance="heading-xs"
          >
            {EDUBOT_NAME} ({message.role})
          </Typography>
          {displayAssistantMessage(message.status, message.chatMessageText)}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
