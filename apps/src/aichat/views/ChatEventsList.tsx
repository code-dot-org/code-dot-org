import React, {useCallback, useEffect, useRef} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatEvent} from '../types';

import ChatEventView from './ChatEventView';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatEventsListProps {
  events: ChatEvent[];
  showWaitingAnimation: boolean;
  isTeacherView?: boolean;
}

/**
 * Renders AI Chat {@link ChatEvent}s using common AI design components.
 */
const ChatEventsList: React.FunctionComponent<ChatEventsListProps> = ({
  events,
  showWaitingAnimation,
  isTeacherView,
}) => {
  const {isWaitingForChatResponse} = useAppSelector(state => state.aichat);

  const displayWaitingAnimation = useCallback(() => {
    if (isWaitingForChatResponse) {
      return (
        <img
          src="/blockly/media/aichat/typing-animation.gif"
          alt={'Waiting for response'}
          className={moduleStyles.waitingForResponse}
        />
      );
    }
  }, [isWaitingForChatResponse]);

  // Compare the chat events  as a string since the object reference will change on every update.
  // This way we will only scroll when the contents of the events have changed.
  const eventsString = JSON.stringify(events);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTo({
        top: conversationContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [eventsString, isWaitingForChatResponse]);

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
      {isWaitingForChatResponse && displayWaitingAnimation()}
    </div>
  );
};

export default ChatEventsList;
