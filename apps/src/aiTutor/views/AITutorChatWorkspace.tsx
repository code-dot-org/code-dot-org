import React from 'react';

import {Role} from '@cdo/apps/aiTutor/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import AITutorSuggestedPrompts from './AITutorSuggestedPrompts';
import AssistantMessage from './AssistantMessage';
import UserMessage from './UserMessage';
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
      {storedMessages.map((message, idx) =>
        message.role === Role.ASSISTANT ? (
          <AssistantMessage message={message} key={idx} />
        ) : (
          <UserMessage message={message} key={idx} />
        )
      )}
      {showWaitingAnimation()}
      <WarningModal />
      <AITutorSuggestedPrompts />
    </div>
  );
};

export default AITutorChatWorkspace;
