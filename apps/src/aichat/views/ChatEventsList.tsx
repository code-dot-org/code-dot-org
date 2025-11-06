import Button from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatAsset, ChatEvent} from '../types';

import {ChatDisabled} from './ChatDisabled';
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
  const {chatDisabled, chatDisabledMessage} = useAiChatDisabled();
  const [isInChatNavigationMode, setIsInChatNavigationMode] = useState(false);
  const [inProgrammaticScroll, setInProgrammaticScroll] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(true);
  const isWaitingForChatResponse = useAppSelector(
    state => !!state.aichat.chatMessagePending
  );

  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const finalEventRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (conversationContainerRef.current) {
      setShowScrollToBottom(false);
      setInProgrammaticScroll(true);

      if (!isAtBottom()) {
        conversationContainerRef.current.scrollTo({
          top: conversationContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
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

  const handleParentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && e.key === 'Enter') {
      setIsInChatNavigationMode(true);
      finalEventRef.current?.focus();
    }
  };

  useEffect(() => {
    const container = conversationContainerRef.current;

    if (!container) {
      return;
    }

    const handleUserScroll = () => {
      setShowScrollToBottom(!isAtBottom());
    };

    let previousScrollTop: number | null = null;
    let scrollEndIntervalId: number;
    let resizeObserver: ResizeObserver | undefined;

    // If we're in a programmatic scroll, set up an interval to detect when programmatic scroll has
    // ended. We do not show the scroll to bottom button until the programmatic scroll finishes.
    if (inProgrammaticScroll) {
      scrollEndIntervalId = window.setInterval(() => {
        if (conversationContainerRef.current) {
          if (
            previousScrollTop === conversationContainerRef.current.scrollTop
          ) {
            window.clearInterval(scrollEndIntervalId);
            setInProgrammaticScroll(false);
            setShowScrollToBottom(!isAtBottom());
            previousScrollTop = null;
          } else {
            previousScrollTop = conversationContainerRef.current.scrollTop;
          }
        }
      }, 250);
    }
    // Otherwise, set up the user scroll handler to display the scroll button when not at scroll end.
    else {
      container.addEventListener('scroll', handleUserScroll);
      resizeObserver = new ResizeObserver(handleUserScroll);
      resizeObserver.observe(container);
    }

    return () => {
      container?.removeEventListener('scroll', handleUserScroll);
      resizeObserver?.disconnect();
      window.clearInterval(scrollEndIntervalId);
    };
  }, [inProgrammaticScroll]);

  useEffect(scrollToBottom, [events.length, isWaitingForChatResponse]);

  return (
    <div
      id="chat-workspace-conversation"
      ref={parentRef}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-label={
        isInChatNavigationMode
          ? ''
          : 'Chat history: press Enter to navigate, Escape to exit'
      }
      onKeyDown={handleParentKeyDown}
      className={classNames(
        moduleStyles.conversationArea,
        moduleStyles.scrollToBottomContainer
      )}
    >
      <div className={moduleStyles.messageArea} ref={conversationContainerRef}>
        {chatDisabled ? (
          <ChatDisabled message={chatDisabledMessage} />
        ) : (
          <>
            {events.map((event, id) => (
              <ChatEventView
                event={event}
                key={event.timestamp}
                isTeacherView={isTeacherView}
                buildAssetUrl={buildAssetUrl}
                ref={id === events.length - 1 ? finalEventRef : undefined}
                tabIndex={isInChatNavigationMode ? 0 : -1}
                onKeyDown={e => {
                  if (e.key === 'Escape' && e.target === e.currentTarget) {
                    setIsInChatNavigationMode(false);
                    parentRef.current?.focus();
                  }
                }}
              />
            ))}
            <WaitingAnimation shouldDisplay={isWaitingForChatResponse} />
          </>
        )}
      </div>
      {showScrollToBottom && (
        <div className={moduleStyles.floatingScrollToBottomButtonContainer}>
          <Button
            isIconOnly
            icon={{iconName: 'arrow-down'}}
            size="xs"
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
