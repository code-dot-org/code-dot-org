import React, {useEffect, useRef} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatEvent} from '../types';

import ChatEventView from './ChatEventView';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatWithModelProps {
  events: ChatEvent[];
  showWaitingAnimation: () => React.ReactNode;
}

/**
 * Renders AI Chat {@link ChatEvent}s using common AI design components.
 */
const ChatWithModel: React.FunctionComponent<ChatWithModelProps> = ({
  events,
  showWaitingAnimation,
}) => {
  const {isWaitingForChatResponse} = useAppSelector(state => state.aichat);
  // Compare the messages as a string since the object reference will change on every update.
  // This way we will only scroll when the contents of the messages have changed.
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
        <ChatEventView event={event} key={event.timestamp} />
      ))}
      {showWaitingAnimation()}
    </div>
  );
};

export default ChatWithModel;
