import React, {useEffect, useRef} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import aichatI18n from '../locale';
import {ChatEvent} from '../types';

import ChatEventView from './ChatEventView';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatEventsListProps {
  events: ChatEvent[];
  isTeacherView?: boolean;
}

/**
 * Renders AI Chat {@link ChatEvent}s using common AI design components.
 */
const ChatEventsList: React.FunctionComponent<ChatEventsListProps> = ({
  events,
  isTeacherView,
}) => {
  const {isWaitingForChatResponse} = useAppSelector(state => state.aichat);

  const conversationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to the bottom of the conversation when new events are added
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTo({
        top: conversationContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [events.length, isWaitingForChatResponse]);

  return (
    <div
      id="chat-workspace-conversation"
      className={moduleStyles.conversationArea}
      ref={conversationContainerRef}
    >
      {events.map(event => (
        <ChatEventView
          event={event}
          key={event.timestamp}
          isTeacherView={isTeacherView}
        />
      ))}
      <WaitingAnimation shouldDisplay={isWaitingForChatResponse} />
    </div>
  );
};

const WaitingAnimation: React.FunctionComponent<{shouldDisplay: boolean}> = ({
  shouldDisplay,
}) => {
  if (shouldDisplay) {
    return (
      <img
        src="/blockly/media/aichat/typing-animation.gif"
        alt={aichatI18n.chatEventDescriptions_waitForResponse()}
        className={moduleStyles.waitingForResponse}
      />
    );
  }
  return null;
};

export default ChatEventsList;
