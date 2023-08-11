import React, {useState, useCallback} from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatWarningModal from '@cdo/apps/aichat/views/ChatWarningModal';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import aichatI18n from '../locale';

import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend

const ChatWorkspace: React.FunctionComponent = () => {
  const [showWarningModal, setShowWarningModal] = useState(true);
  const onCloseWarningModal = useCallback(
    () => setShowWarningModal(false),
    [setShowWarningModal]
  );

  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      {showWarningModal && <ChatWarningModal onClose={onCloseWarningModal} />}
      <PanelContainer
        id="chat-workspace-panel"
        headerText={aichatI18n.aichatWorkspaceHeader()}
      >
        <div
          id="chat-workspace-conversation"
          className={moduleStyles.conversationArea}
        >
          {demoChatMessages.map(message => (
            <ChatMessage chatMessage={message} />
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
  );
};
export default ChatWorkspace;
