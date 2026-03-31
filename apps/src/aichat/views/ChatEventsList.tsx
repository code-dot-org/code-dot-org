import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectIsWaitingForChatResponse} from '../redux';
import {ChatAsset, ChatEvent, isChatMessage, ModelParameters} from '../types';

import {ChatDisabled} from './ChatDisabled';
import ChatEventView from './ChatEventView';
import EmptyStudentChatHistory from './EmptyStudentChatHistory';
import WaitingAnimation from './WaitingAnimation';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatEventsListProps {
  clientType?: string;
  modelParameters?: ModelParameters;
  events: ChatEvent[];
  isTeacherView?: boolean;
  buildAssetUrl?: (asset: ChatAsset) => string;
  hasInstructionsDrawer?: boolean;
  lastMessagePostText?: React.ReactNode;
}

/**
 * Renders AI Chat {@link ChatEvent}s using common AI design components.
 */
const ChatEventsList: React.FunctionComponent<ChatEventsListProps> = ({
  clientType,
  modelParameters,
  events,
  isTeacherView,
  buildAssetUrl,
  hasInstructionsDrawer,
  lastMessagePostText,
}) => {
  const {chatDisabled, chatDisabledMessage} = useAiChatDisabled();
  const [isInChatNavigationMode, setIsInChatNavigationMode] = useState(false);
  const [inProgrammaticScroll, setInProgrammaticScroll] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(true);
  const isWaitingForChatResponse = useAppSelector(
    selectIsWaitingForChatResponse
  );

  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const previousLastMessageRole = useRef<Role | null>(null);
  const previousEventsLength = useRef<number | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const finalEventRef = useRef<HTMLDivElement>(null);

  const scrollToLastMessage = useCallback((keepTopOfMessageVisible = false) => {
    if (conversationContainerRef.current) {
      setShowScrollToBottom(false);
      setInProgrammaticScroll(true);

      if (keepTopOfMessageVisible) {
        finalEventRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else if (!isAtBottom()) {
        conversationContainerRef.current.scrollTo({
          top: conversationContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, []);

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

  const isTeacherViewEmptyStudentChatHistory = useMemo(() => {
    return isTeacherView && events.length === 0;
  }, [isTeacherView, events]);

  const lastChatMessageIndex = useMemo(() => {
    if (!lastMessagePostText) return -1;
    for (let i = events.length - 1; i >= 0; i--) {
      if (isChatMessage(events[i])) return i;
    }
    return -1;
  }, [events, lastMessagePostText]);

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

  useEffect(() => {
    if (previousEventsLength.current !== events.length) {
      previousEventsLength.current = events.length;

      const lastMessage = events[events.length - 1];
      let lastMessageRole: Role | null = null;
      if (lastMessage && isChatMessage(lastMessage)) {
        lastMessageRole = lastMessage.role;
      }

      // Heuristic to determine if we have an incoming assistant message and need to scroll only
      // to the top of the incoming message, For all other messages we scroll to the bottom.
      // Checking previousLastMessageRole.current is truthy avoids triggering this behavior when
      // the history is first loaded.
      const isIncomingAssistantMessage =
        lastMessageRole === 'assistant' &&
        previousLastMessageRole.current &&
        previousLastMessageRole.current !== 'assistant';

      if (isIncomingAssistantMessage) {
        // Scroll to top of last message.
        scrollToLastMessage(true);
      } else {
        // Scroll to bottom of last message.
        scrollToLastMessage();
      }

      previousLastMessageRole.current = lastMessageRole;
    }
  }, [events, events.length, scrollToLastMessage]);

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
            {hasInstructionsDrawer && (
              <div className={moduleStyles.instructionsDrawerInset} />
            )}
            {isTeacherViewEmptyStudentChatHistory && (
              <EmptyStudentChatHistory />
            )}
            {events.map((event, index) => {
              const isLastEvent = index === events.length - 1;
              const isLastChatMessage = index === lastChatMessageIndex;
              return (
                <ChatEventView
                  event={event}
                  key={event.timestamp}
                  isTeacherView={isTeacherView}
                  buildAssetUrl={buildAssetUrl}
                  clientType={clientType}
                  modelParameters={modelParameters}
                  postText={isLastChatMessage ? lastMessagePostText : undefined}
                  ref={isLastEvent ? finalEventRef : undefined}
                  tabIndex={isInChatNavigationMode ? 0 : -1}
                  onKeyDown={e => {
                    if (e.key === 'Escape' && e.target === e.currentTarget) {
                      setIsInChatNavigationMode(false);
                      parentRef.current?.focus();
                    }
                  }}
                />
              );
            })}
            <WaitingAnimation shouldDisplay={isWaitingForChatResponse} />
          </>
        )}
      </div>
      {showScrollToBottom && (
        <div className={moduleStyles.floatingScrollToBottomButtonContainer}>
          <MuiIconButton
            variant="outlined"
            color="secondary"
            size="extraSmall"
            className={moduleStyles.scrollToBottomButton}
            onClick={() => scrollToLastMessage()}
            aria-label="Scroll to bottom of messages"
            type="button"
            aria-controls="chat-workspace-conversation"
          >
            <FontAwesomeV6Icon iconName="arrow-down" />
          </MuiIconButton>
        </div>
      )}
    </div>
  );
};

export default ChatEventsList;
