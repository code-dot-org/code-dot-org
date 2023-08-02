import React from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import aichatI18n from '../locale';
import classNames from 'classnames';

import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend

const ChatWorkspace: React.FunctionComponent = () => {
  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
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
            <ChatMessage chatMessage={message} />
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
    </div>
  );
};
export default ChatWorkspace;
