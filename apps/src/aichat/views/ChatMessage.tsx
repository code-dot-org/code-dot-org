import React from 'react';
import color from '@cdo/apps/util/color';

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
        <div style={styles.userMessageContainer}>
          <div style={{...styles.messageHeaderContainer, ...styles.name}}>
            {name} ({role})
          </div>
          {isVisible(status) && isUser(role) && (
            <div
              id={'chat-workspace-message-body'}
              style={{
                ...styles.message,
                ...styles.userMessage,
              }}
            >
              {chatMessageText}
            </div>
          )}
          {isInappropriate(status) && (
            <div
              id={'chat-workspace-message-body-inappropriate'}
              style={{
                ...styles.message,
                ...styles.inappropriateMessage,
              }}
            >
              {INAPPROPRIATE_MESSAGE}
            </div>
          )}
          {isTooPersonal(status) && (
            <div
              id={'chat-workspace-message-body-too-personal'}
              style={{
                ...styles.message,
                ...styles.tooPersonalMessage,
              }}
            >
              {TOO_PERSONAL_MESSAGE}
            </div>
          )}
        </div>
      )}

      {isAssistant(role) && (
        <div style={styles.assistantMessageContainer}>
          <div style={{...styles.messageHeaderContainer, ...styles.name}}>
            {name} ({role})
          </div>
          {isVisible(status) && isAssistant(role) && (
            <div
              id={'chat-workspace-message-body'}
              style={{
                ...styles.message,
                ...styles.assistantMessage,
              }}
            >
              {chatMessageText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  name: {
    fontFamily: '"Gotham 5r"',
  },
  message: {
    backgroundColor: color.lighter_gray,
    padding: '10px 12px',
  },
  userMessageContainer: {
    margin: '0 0 25px 50px',
    borderRadius: 10,
    overflow: 'hidden',
  },
  assistantMessageContainer: {
    margin: '0 50px 25px 0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  userMessage: {
    backgroundColor: color.lightest_cyan,
  },
  assistantMessage: {
    backgroundColor: color.lightest_gray,
  },
  inappropriateMessage: {
    backgroundColor: color.lightest_red,
  },
  tooPersonalMessage: {
    backgroundColor: color.lightest_yellow,
  },
  messageHeaderContainer: {
    margin: '0 0 5px 0',
  },
};

export default ChatMessage;
