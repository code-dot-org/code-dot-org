import React, {useRef, useEffect, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {initialAssistantGreeting} from '../constants';
import {ChatCompletionMessage} from '../types';

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

  const findAssistantLastIndex = (array: ChatCompletionMessage[]) => {
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i].role === Role.ASSISTANT) {
        return i;
      }
    }
    return -1;
  };
  const lastAssistantMessageIndex = findAssistantLastIndex(storedMessages);
  const isLastMessageFromAssistant =
    storedMessages.length - 1 === lastAssistantMessageIndex;

  useEffect(() => {
    console.log('conversation useEffect', conversationContainerRef.current);
    // Autoscroll to the bottom of the workspace when new user messages, suggested prompts,
    // or waiting animation is displayed.
    setTimeout(() => {
      if (conversationContainerRef.current) {
        conversationContainerRef.current.scrollTo({
          top: conversationContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 250); // Small delay to ensure DOM updates before scrolling.
  }, [
    storedMessages.length,
    isWaitingForChatResponse,
    showSuggestedPrompts,
    feedbackDetailsOpen,
    isLastMessageFromAssistant,
  ]);
  useEffect(() => {
    console.log('lastAssistant useEffect', lastAssistantMessageRef.current);
    // Autoscroll to the top of the latest assistant message.
    setTimeout(() => {
      if (lastAssistantMessageRef.current && isLastMessageFromAssistant) {
        lastAssistantMessageRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start', // Ensures it scrolls to the top of the message.
        });
      }
    }, 250); // Small delay to ensure DOM updates before scrolling.
  }, [
    storedMessages.length,
    isWaitingForChatResponse,
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
