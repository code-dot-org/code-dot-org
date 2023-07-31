import React from 'react';
import styles from './chatMessage.module.scss';
import classNames from 'classnames';

interface ChatMessageProps {
  id: string;
  name: string;
  role: string;
  chatMessageText: string;
  status: string;
}

const isVisible = (status: string) => {
  return status === 'ok';
};

const isAssistant = (role: string) => {
  return role === 'assistant';
};

const isUser = (role: string) => {
  return role === 'user';
};

const isInappropriate = (status: string) => {
  return status === 'inappropriate';
};

const isTooPersonal = (status: string) => {
  return status === 'personal';
};

const INAPPROPRIATE_MESSAGE = 'This message has been flagged as inappropriate.';
const TOO_PERSONAL_MESSAGE = 'This message has been flagged as too personal.';

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  id,
  name,
  role,
  chatMessageText,
  status,
}) => {
  return (
    <div id={id}>
      {isUser(role) && (
        <div className={styles.userMessageContainer}>
          <div
            className={classNames(styles.messageHeaderContainer, styles.name)}
          >
            {name} ({role})
          </div>
          {isVisible(status) && isUser(role) && (
            <div
              id={'chat-workspace-message-body'}
              className={classNames(styles.message, styles.userMessage)}
            >
              {chatMessageText}
            </div>
          )}
          {isInappropriate(status) && (
            <div
              id={'chat-workspace-message-body-inappropriate'}
              className={classNames(
                styles.message,
                styles.inappropriateMessage
              )}
            >
              {INAPPROPRIATE_MESSAGE}
            </div>
          )}
          {isTooPersonal(status) && (
            <div
              id={'chat-workspace-message-body-too-personal'}
              className={classNames(styles.message, styles.tooPersonalMessage)}
            >
              {TOO_PERSONAL_MESSAGE}
            </div>
          )}
        </div>
      )}

      {isAssistant(role) && (
        <div className={styles.assistantMessageContainer}>
          <div
            className={classNames(styles.messageHeaderContainer, styles.name)}
          >
            {name} ({role})
          </div>
          {isVisible(status) && isAssistant(role) && (
            <div
              id={'chat-workspace-message-body'}
              className={classNames(styles.message, styles.assistantMessage)}
            >
              {chatMessageText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
