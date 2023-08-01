import React from 'react';
import moduleStyles from './chatMessage.module.scss';
import classNames from 'classnames';

interface ChatMessageProps {
  id: string;
  name: string;
  role: string;
  chatMessageText: string;
  status: string;
}

const INAPPROPRIATE_MESSAGE = 'This message has been flagged as inappropriate.';
const TOO_PERSONAL_MESSAGE = 'This message has been flagged as too personal.';

const isAssistant = (role: string) => {
  return role === 'assistant';
};

const isUser = (role: string) => {
  return role === 'user';
};

const displayUserMessage = (status: string, chatMessageText: string) => {
  if (status === 'ok') {
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
  } else if (status === 'personal') {
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
  if (status === 'ok') {
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

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  id,
  name,
  role,
  chatMessageText,
  status,
}) => {
  return (
    <div id={`ChatMessage id: ${id}`}>
      {isUser(role) && (
        <div className={moduleStyles.userMessageContainer}>
          {displayUserMessage(status, chatMessageText)}
        </div>
      )}

      {isAssistant(role) && (
        <div className={moduleStyles.assistantMessageContainer}>
          <div
            className={classNames(
              moduleStyles.messageHeaderContainer,
              moduleStyles.name
            )}
          >
            {name} ({role})
          </div>
          {displayAssistantMessage(status, chatMessageText)}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
