import React from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import aichatI18n from '../locale';
import {ChatCompletionMessage} from '../types';
import {Role, Status} from '../constants';
import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend

const onSubmit = (name: string, message: string) => {
  console.log(`Submit button clicked with message: ${message}`);
  const lastMessageId = demoChatMessages[demoChatMessages.length - 1].id;
  const newMessage: ChatCompletionMessage = {
    id: lastMessageId + 1,
    name,
    role: Role.USER,
    status: Status.UNKNOWN,
    chatMessageText: message,
  };

  demoChatMessages.push(newMessage);
  console.log(demoChatMessages);
};

const ChatWorkspace: React.FunctionComponent = () => {
  return (
    <ChatWorkspaceContext.Provider value={onSubmit}>
      <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
        <PanelContainer
          id="chat-workspace-panel"
          headerText={aichatI18n.aichatWorkspaceHeader()}
        >
          <div
            id="chat-workspace-conversation"
            className={moduleStyles.conversationArea}
          >
            {demoChatMessages.map(message => (
              <ChatMessage message={message} key={message.id} />
            ))}
          </div>
          <div
            id="chat-workspace-editor"
            className={moduleStyles.userChatMessageEditor}
          >
            <UserChatMessageEditor />
          </div>
        </PanelContainer>
      </div>
    </ChatWorkspaceContext.Provider>
  );
};

export const ChatWorkspaceContext: React.Context<typeof onSubmit> =
  React.createContext<typeof onSubmit>(onSubmit);

export default ChatWorkspace;
