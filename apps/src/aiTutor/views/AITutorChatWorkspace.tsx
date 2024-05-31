import React, { useRef, useEffect} from 'react';

import {Role} from '@cdo/apps/aiTutor/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import style from './ai-tutor.module.scss';
import AssistantMessage from './AssistantMessage';
import UserMessage from './UserMessage';
import WarningModal from './WarningModal';

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

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatContainerRef, storedMessages, isWaitingForChatResponse]);


  return (
    <div id="ai-tutor-chat-workspace" className={style.chatWorkspace}>
      <div ref={chatContainerRef} className={style.chatArea}> 
        {storedMessages.map((message, idx) =>
          message.role === Role.ASSISTANT ? (
            <AssistantMessage message={message} key={idx} />
          ) : (
            <UserMessage message={message} key={idx} />
          )
        )}
        {showWaitingAnimation()}
      </div>
      <WarningModal />
    </div>
  );
};

export default AITutorChatWorkspace;
