import React from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import ChatMessage from './chatMessage';
import UserChatMessageEditor from './userChatMessageEditor';
import style from './chat-workspace.module.scss';
import WarningModal from './warningModal';

/**
 * Renders the AI Tutor main chat workspace component.
 */

interface ChatWorkspaceProps {
  generalChat: boolean;
}

const ChatWorkspace: React.FunctionComponent<ChatWorkspaceProps> = ({
  generalChat,
}) => {
  const storedMessages = useAppSelector(state => state.aiTutor.chatMessages);
  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const showWaitingAnimation = () => {
    if (isWaitingForChatResponse) {
      return (
        <img
          src="/blockly/media/aichat/typing-animation.gif"
          alt={'Waiting for response'}
          className={style.waitingForResponse}
        />
      );
    }
  };

  return (
    <div id="chat-workspace-area" className={style.chatWorkspace}>
      {generalChat && <WarningModal />}
      <div id="chat-workspace-conversation" className={style.conversationArea}>
        {storedMessages.map(message => (
          <ChatMessage message={message} key={message.id} />
        ))}
        {showWaitingAnimation()}
      </div>
      {generalChat && (
        <div id="chat-workspace-editor" className={style.userChatMessageEditor}>
          <UserChatMessageEditor />
        </div>
      )}
    </div>
  );
};

export default ChatWorkspace;
