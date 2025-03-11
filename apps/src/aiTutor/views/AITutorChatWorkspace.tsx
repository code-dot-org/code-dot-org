import React, {useRef, useEffect, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {initialAssistantGreeting} from '../constants';

import AITutorSuggestedPrompts from './AITutorSuggestedPrompts';
import AssistantMessageFeedback from './AssistantMessageFeedback';
import WarningModal from './WarningModal';

import style from './ai-tutor.module.scss';

const AITutorChatWorkspace: React.FunctionComponent = () => {
  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = useRef<HTMLDivElement | null>(null);
  const storedMessages = useAppSelector(state => state.aiTutor.chatMessages);
  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );
  const showSuggestedPrompts = useAppSelector(
    state => state.aiTutor.showSuggestedPrompts
  );

  const [feedbackDetailsOpen, setFeedbackDetailsOpen] = useState(false);

  const lastAssistantMessageIndex = storedMessages
    .map(msg => msg.role)
    .lastIndexOf(Role.ASSISTANT);

  const isLastMessageFromAssistant =
    lastAssistantMessageIndex === storedMessages.length - 1;

  useEffect(() => {
    if (!conversationContainerRef.current) return;

    setTimeout(() => {
      if (isLastMessageFromAssistant && lastAssistantMessageRef.current) {
        // Scroll to the top of the latest assistant message
        lastAssistantMessageRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        // Scroll to the bottom for user messages or other elements
        conversationContainerRef.current?.scrollTo({
          top: conversationContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 250); // Small delay to allow DOM updates
  }, [
    storedMessages.length,
    isWaitingForChatResponse,
    showSuggestedPrompts,
    feedbackDetailsOpen,
    isLastMessageFromAssistant,
  ]);

  return (
    <div id="ai-tutor-chat-workspace" className={style.aiTutorChatWorkspace}>
      <div
        className={style.conversationContainer}
        ref={conversationContainerRef}
      >
        {storedMessages.map((message, index) => {
          const isLastAssistantMessage = index === lastAssistantMessageIndex;
          return (
            <div
              key={message.id ?? `message-${index}`}
              ref={isLastAssistantMessage ? lastAssistantMessageRef : null}
            >
              <ChatMessage
                text={message.chatMessageText}
                role={message.role}
                customStyles={style}
                footer={
                  message.role === Role.ASSISTANT &&
                  message.chatMessageText !== initialAssistantGreeting ? (
                    <AssistantMessageFeedback
                      messageId={message.id}
                      onDetailsOpenChange={setFeedbackDetailsOpen}
                    />
                  ) : null
                }
              />
            </div>
          );
        })}
        <WaitingAnimation shouldDisplay={isWaitingForChatResponse} />
        <AITutorSuggestedPrompts />
      </div>
      <WarningModal />
    </div>
  );
};

const WaitingAnimation: React.FunctionComponent<{shouldDisplay: boolean}> = ({
  shouldDisplay,
}) => {
  if (shouldDisplay) {
    return (
      <div className={style.waitingAnimationWrapper}>
        <img
          src="/blockly/media/aichat/typing-animation.gif"
          alt={'Waiting for response'}
          className={style.waitingForResponse}
        />
      </div>
    );
  }
  return null;
};
export default AITutorChatWorkspace;
