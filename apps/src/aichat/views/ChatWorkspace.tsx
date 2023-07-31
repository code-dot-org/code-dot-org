import React from 'react';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import {demoChatMessages} from './chatMessageShape'; // demo chat messages - remove when connected to backend
import styles from './chatWorkspace.module.scss';

const ChatWorkspace: React.FunctionComponent = () => {
  return (
    <div id="chat-workspace" className={styles.chatArea}>
      {demoChatMessages.map(message => (
        <ChatMessage
          id={message.id}
          name={message.name}
          role={message.role}
          chatMessageText={message.chatMessageText}
          status={message.status}
        />
      ))}
      <UserChatMessageEditor />
    </div>
  );
};

export default ChatWorkspace;
