import React from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {initialAssistantGreeting} from '../constants';

import AITutorSuggestedPrompts from './AITutorSuggestedPrompts';
import AssistantMessageFeedback from './AssistantMessageFeedback';
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
        <ChatMessage
          text={message.chatMessageText}
          role={message.role}
          customStyles={style}
          footer={
            message.role === Role.ASSISTANT &&
            message.chatMessageText !== initialAssistantGreeting ? (
              <AssistantMessageFeedback messageId={message.id} />
            ) : null
          }
        />
      ))}
      {showWaitingAnimation()}
      <WarningModal />
      <AITutorSuggestedPrompts />
    </div>
  );
};

export default AITutorChatWorkspace;
