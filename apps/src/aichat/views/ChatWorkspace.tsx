import React from 'react';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import {demoChatMessages} from './chatMessageShape'; // demo chat messages - remove when connected to backend

const ChatWorkspace: React.FunctionComponent = () => {
  return (
    <div style={styles.container}>
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

const styles = {
  container: {
    margin: '10px 5%',
  },
  label: {
    margin: 0,
  },
};
export default ChatWorkspace;
