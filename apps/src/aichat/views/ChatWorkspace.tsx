import React from 'react';
import classNames from 'classnames';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import aichatI18n from '../locale';

import {demoChatMessages} from './chatMessageShape'; // demo chat messages - remove when connected to backend

const ChatWorkspace: React.FunctionComponent = () => {
  return (
    <PanelContainer
      id="chat-workspace-panel"
      headerText={aichatI18n.aichatWorkspaceHeader()}
    >
      <div
        id="chat-workspace-conversation"
        className={classNames(
          moduleStyles.chatWorkspace,
          moduleStyles.conversationArea
        )}
      >
        {demoChatMessages.map(message => (
          <ChatMessage
            id={message.id}
            name={message.name}
            role={message.role}
            chatMessageText={message.chatMessageText}
            status={message.status}
          />
        ))}
      </div>
      <div
        id="chat-workspace-editor"
        className={classNames(
          moduleStyles.chatWorkspace,
          moduleStyles.userChatMessageEditor
        )}
      >
        <UserChatMessageEditor />
      </div>
    </PanelContainer>
  );
};
export default ChatWorkspace;
