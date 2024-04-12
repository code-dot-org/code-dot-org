import React from 'react';

import {Role} from '@cdo/apps/aiTutor/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import style from './ai-tutor.module.scss';
import AssistantMessage from './AssistantMessage';
import UserMessage from './UserMessage';

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
      {storedMessages.map(message =>
        message.role === Role.ASSISTANT ? (
          <AssistantMessage message={message} key={message.id} />
        ) : (
          <UserMessage message={message} key={message.id} />
        )
      )}
      {showWaitingAnimation()}
    </div>
  );
};

export default AITutorChatWorkspace;
