import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button';
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
  const [inProgrammaticScroll, setInProgrammaticScroll] = useState(false);
  const [atBottomOfContent, setAtBottomofContent] = useState(true);
  const {isWaitingForChatResponse} = useAppSelector(state => state.aichat);

  // Compare the chat events  as a string since the object reference will change on every update.
  // This way we will only scroll when the contents of the events have changed.
  const eventsString = JSON.stringify(events);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (conversationContainerRef.current) {
      setInProgrammaticScroll(true);
      conversationContainerRef.current.scrollTo({
        top: conversationContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });

      const intervalId = setInterval(() => {
        const atBottom = isAtBottom();
        if (atBottom) {
          setInProgrammaticScroll(false);
          setAtBottomofContent(true);
          clearInterval(intervalId);
        }
      }, 100);
    }
  };

  const isAtBottom = () => {
    const container = conversationContainerRef.current;

    if (!container) {
      return false;
    }

    return (
      container.scrollTop + container.clientHeight + 1 >= container.scrollHeight
    );
  };

  useEffect(() => {
    const container = conversationContainerRef.current;

    const handleScroll = () => {
      if (container && !inProgrammaticScroll) {
        setAtBottomofContent(isAtBottom());
      }
    };

    container?.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [inProgrammaticScroll]);

  useEffect(scrollToBottom, [eventsString, isWaitingForChatResponse]);

  return (
    <div
      id="chat-workspace-conversation"
      className={classNames(
        moduleStyles.conversationArea,
        moduleStyles.scrollToBottomContainer
      )}
    >
      <div className={moduleStyles.messageArea} ref={conversationContainerRef}>
        {events.map(event => (
          <ChatEventView
            event={event}
            key={event.timestamp}
            isTeacherView={isTeacherView}
          />
        ))}
        <WaitingAnimation shouldDisplay={isWaitingForChatResponse} />
      </div>
      {!atBottomOfContent && (
        <div className={moduleStyles.floatingScrollToBottomButtonContainer}>
          <Button
            isIconOnly
            icon={{iconName: 'arrow-down'}}
            size="s"
            color="black"
            type="secondary"
            onClick={scrollToBottom}
          />
        </div>
      )}
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
