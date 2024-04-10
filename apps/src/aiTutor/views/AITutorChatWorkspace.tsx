import React from 'react';
import style from './ai-tutor.module.scss';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import Message from './Message';
import WarningModal from './WarningModal';

// AI Tutor feature that allows students to ask for help with compilation errors
// or general questions about the curriculum.

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
    <div className={style.tutorContainer}>
      <div id="chat-workspace-area" className={style.chatWorkspace}>
        {/* <WarningModal /> */}
        <div
          id="chat-workspace-conversation"
          className={style.conversationArea}
        >
          {storedMessages.map(message => (
            <Message message={message} key={message.id} />
          ))}
          {/* TODO: This is massive and needs to be smaller*/}
          {showWaitingAnimation()}
        </div>
      </div>
    </div>
  );
};

export default AITutorChatWorkspace;
