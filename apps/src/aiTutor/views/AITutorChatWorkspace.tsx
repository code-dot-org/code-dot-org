import React, {useEffect, useMemo, useRef, useState} from 'react';

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
  const prevMessagesCountRef = useRef(storedMessages.length);
  const prevFeedbackDetailsOpenRef = useRef(feedbackDetailsOpen);

  const lastAssistantMessageIndex = useMemo(
    () => storedMessages.map(msg => msg.role).lastIndexOf(Role.ASSISTANT),
    [storedMessages]
  );
  const isLastMessageFromAssistant =
    lastAssistantMessageIndex === storedMessages.length - 1;

  const scrollToBottom = () => {
    conversationContainerRef.current?.scrollTo({
      top: conversationContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const scrollToAssistantMessage = () => {
    lastAssistantMessageRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    if (!conversationContainerRef.current) {
      return;
    }

    const isNewMessage = storedMessages.length !== prevMessagesCountRef.current;
    // Tracks if assistant feedback details section was just opened.
    const isFeedbackOpened =
      feedbackDetailsOpen && !prevFeedbackDetailsOpenRef.current;

    setTimeout(() => {
      if (isNewMessage) {
        isLastMessageFromAssistant
          ? scrollToAssistantMessage()
          : scrollToBottom();
      } else if (isFeedbackOpened || showSuggestedPrompts) {
        scrollToBottom();
      }

      // Update refs to track changes in number of stored messages and whether
      // assistant feedback details is open.
      prevMessagesCountRef.current = storedMessages.length;
      prevFeedbackDetailsOpenRef.current = feedbackDetailsOpen;
    }, 200); // Small delay to allow DOM updates
  }, [
    storedMessages.length,
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
          alt="Waiting for response"
          className={style.waitingForResponse}
        />
      </div>
    );
  }
  return null;
};

export default AITutorChatWorkspace;
