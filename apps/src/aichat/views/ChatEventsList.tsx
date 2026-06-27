import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectIsWaitingForChatResponse} from '../redux';
import {
  AiChatDisabledState,
  ChatAsset,
  ChatEvent,
  isChatMessage,
  ModelParameters,
} from '../types';

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
  disabledState?: AiChatDisabledState;
  renderLastMessagePostText?: (
    onRequestScrollToBottom: () => void
  ) => React.ReactNode;
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
  disabledState,
  renderLastMessagePostText,
}) => {
  const chatDisabled = disabledState?.disabled ?? false;
  const chatDisabledMessage = disabledState?.disabledMessage;
  const chatDisabledLink = disabledState?.disabledLink;

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
  // Whether the user is pinned to the bottom. Re-pinned on resize unless a scroll
  // up has cleared it.
  const pinnedToBottomRef = useRef(true);
  // Previous scrollTop, for scroll direction. Only an upward scroll un-pins; the
  // re-pin's own writes and the grow-time clamp move scrollTop toward the bottom,
  // so direction tells intent from byproduct.
  const lastScrollTopRef = useRef(0);

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

  const hasChatHistory = events.length > 0;

  const resolvedLastMessagePostText = useMemo(() => {
    if (renderLastMessagePostText) {
      return renderLastMessagePostText(scrollToLastMessage);
    }
  }, [renderLastMessagePostText, scrollToLastMessage]);

  const lastChatMessageIndex = useMemo(() => {
    if (!resolvedLastMessagePostText) return -1;
    for (let i = events.length - 1; i >= 0; i--) {
      if (isChatMessage(events[i])) return i;
    }
    return -1;
  }, [events, resolvedLastMessagePostText]);

  useEffect(() => {
    const container = conversationContainerRef.current;

    if (!container) {
      return;
    }

    const handleUserScroll = () => {
      const container = conversationContainerRef.current;
      if (!container) {
        return;
      }
      const atBottom = isAtBottom();
      const scrolledUp = container.scrollTop < lastScrollTopRef.current;
      lastScrollTopRef.current = container.scrollTop;
      // Reaching the bottom pins; an upward scroll un-pins; anything else leaves it.
      if (atBottom) {
        pinnedToBottomRef.current = true;
      } else if (scrolledUp) {
        pinnedToBottomRef.current = false;
      }
      setShowScrollToBottom(!atBottom);
    };

    // On resize (e.g. the drawer opening shrinks the chat), re-pin to the bottom
    // if the user was already there. Jump, not smooth, to stay glued every frame.
    const handleResize = () => {
      const container = conversationContainerRef.current;
      if (pinnedToBottomRef.current && container) {
        container.scrollTop = container.scrollHeight;
      }
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
            pinnedToBottomRef.current = isAtBottom();
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
      resizeObserver = new ResizeObserver(handleResize);
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
        {chatDisabled && !(isTeacherView && hasChatHistory) ? (
          <ChatDisabled message={chatDisabledMessage} link={chatDisabledLink} />
        ) : (
          <>
            {hasInstructionsDrawer && (
              <div className={moduleStyles.instructionsDrawerInset} />
            )}
            {isTeacherView && !hasChatHistory && <EmptyStudentChatHistory />}
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
                  postText={
                    isLastChatMessage ? resolvedLastMessagePostText : undefined
                  }
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
