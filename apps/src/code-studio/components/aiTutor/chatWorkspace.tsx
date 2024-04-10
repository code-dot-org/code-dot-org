import React from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import ChatMessage from './chatMessage';
import UserChatMessageEditor from './userChatMessageEditor';
import style from './chat-workspace.module.scss';
import WarningModal from './warningModal';
import {AITutorTypes as TutorTypes} from '@cdo/apps/aiTutor/types';

/**
 * Renders the AI Tutor main chat workspace component.
 */

const ChatWorkspace: React.FunctionComponent = () => {
  const storedMessages = useAppSelector(state => state.aiTutor.chatMessages);
  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );
  const tutorType = useAppSelector(state => state.aiTutor.selectedTutorType);

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

  const generalChat = tutorType === TutorTypes.GENERAL_CHAT;

  return (
    <div id="chat-workspace-area" className={style.chatWorkspace}>
      {generalChat && <WarningModal />}
      <div id="chat-workspace-conversation" className={style.conversationArea}>
        {storedMessages.map(message => (
          <ChatMessage message={message} key={message.id} />
        ))}
        {showWaitingAnimation()}
      </div>
      <div id="chat-workspace-editor" className={style.userChatMessageEditor}>
        <UserChatMessageEditor />
      </div>
    </div>
  );
};

export default ChatWorkspace;
