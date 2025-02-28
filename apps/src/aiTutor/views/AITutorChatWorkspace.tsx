import React from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import AITutorSuggestedPrompts from './AITutorSuggestedPrompts';
import WarningModal from './WarningModal';

import style from './ai-tutor.module.scss';

const AITutorChatWorkspace: React.FunctionComponent = () => {
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
    <div id="ai-tutor-chat-workspace">
      {storedMessages.map(message => (
        <ChatMessage text={message.chatMessageText} role={message.role} />
      ))}
      {showWaitingAnimation()}
      <WarningModal />
      <AITutorSuggestedPrompts />
    </div>
  );
};

export default AITutorChatWorkspace;
