import Button from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatAsset, ChatEvent} from '../types';

import ChatEventView from './ChatEventView';
import WaitingAnimation from './WaitingAnimation';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatEventsListProps {
  events: ChatEvent[];
  isTeacherView?: boolean;
  buildAssetUrl?: (asset: ChatAsset) => string;
}

/**
 * Renders AI Chat {@link ChatEvent}s using common AI design components.
 */
const ChatEventsList: React.FunctionComponent<ChatEventsListProps> = ({
  events,
  isTeacherView,
  buildAssetUrl,
}) => {
  const [inProgrammaticScroll, setInProgrammaticScroll] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(true);
  const isWaitingForChatResponse = useAppSelector(
    state => !!state.aichat.chatMessagePending
  );

  const conversationContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (conversationContainerRef.current) {
      setShowScrollToBottom(false);

      if (!isAtBottom()) {
        setInProgrammaticScroll(true);
        conversationContainerRef.current.scrollTo({
          top: conversationContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });

        const intervalId = setInterval(() => {
          if (isAtBottom()) {
            setInProgrammaticScroll(false);
            clearInterval(intervalId);
          }
        }, 100);
      }
    }
  };

  const isAtBottom = () => {
    const container = conversationContainerRef.current;

    if (!container) {
      return false;
    }

    // Add a pixel of buffer to account for rounding errors.
    return (
      container.scrollTop + container.clientHeight + 1 >= container.scrollHeight
    );
  };

  useEffect(() => {
    const container = conversationContainerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      if (!inProgrammaticScroll) {
        setShowScrollToBottom(!isAtBottom());
      }
    };

    container.addEventListener('scroll', handleScroll);

    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
      resizeObserver?.disconnect();
    };
  }, [inProgrammaticScroll]);

  useEffect(scrollToBottom, [events.length, isWaitingForChatResponse]);

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
            buildAssetUrl={buildAssetUrl}
          />
        ))}
        <WaitingAnimation shouldDisplay={isWaitingForChatResponse} />
      </div>
      {showScrollToBottom && (
        <div className={moduleStyles.floatingScrollToBottomButtonContainer}>
          <Button
            isIconOnly
            icon={{iconName: 'arrow-down'}}
            size="s"
            color="black"
            type="secondary"
            onClick={scrollToBottom}
            className={moduleStyles.scrollToBottomButton}
          />
        </div>
      )}
    </div>
  );
};

export default ChatEventsList;
