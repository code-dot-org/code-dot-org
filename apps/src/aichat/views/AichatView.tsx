import React from 'react';
// import ChatWorkspace from './ChatWorkspace';
import moduleStyles from './aichat.module.scss';
import classNames from 'classnames';
import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import aichatI18n from '../locale';

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
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
    </div>
  );
};

export default AichatView;
