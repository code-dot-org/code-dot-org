import React from 'react';
import style from './ai-tutor.module.scss';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import Message from './Message';

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
        <Message message={message} key={message.id} />
      ))}
      {showWaitingAnimation()}
    </div>
  );
};

export default AITutorChatWorkspace;
