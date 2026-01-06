import Button from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {
  FC,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useChatEventsScrollHandler} from '../hooks/useChatEventsScrollHandler';
import {selectIsWaitingForChatResponse} from '../redux';
import {ChatAsset, ChatEvent, isChatMessage} from '../types';

import {ChatDisabled} from './ChatDisabled';
import ChatEventView from './ChatEventView';
import WaitingAnimation from './WaitingAnimation';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatEventsListProps {
  events: ChatEvent[];
  isTeacherView?: boolean;
  buildAssetUrl?: (asset: ChatAsset) => string;
  isAiTutorVersion?: boolean;
}

/**
 * Renders AI Chat {@link ChatEvent}s using common AI design components.
 */
const ChatEventsList: React.FunctionComponent<ChatEventsListProps> = ({
  events,
  isTeacherView,
  buildAssetUrl,
  isAiTutorVersion,
}) => {
  const {chatDisabled, chatDisabledMessage} = useAiChatDisabled();
  const [isInChatNavigationMode, setIsInChatNavigationMode] = useState(false);
  const {
    containerRef,
    lastUserMessageRef,
    spacerRef,
    showScrollToBottom,
    scrollToBottom,
  } = useChatEventsScrollHandler(events);

  const isWaitingForChatResponse = useAppSelector(
    selectIsWaitingForChatResponse
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const finalEventRef = useRef<HTMLDivElement | null>(null);

  const lastUserMessageIndex = useMemo(() => {
    for (let index = events.length - 1; index >= 0; index--) {
      const event = events[index];
      if (isChatMessage(event) && event.role === Role.USER) {
        return index;
      }
    }
    return -1;
  }, [events]);

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && e.target === e.currentTarget) {
        setIsInChatNavigationMode(false);
        parentRef.current?.focus();
      }
    },
    []
  );

  const handleParentKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && e.key === 'Enter') {
        setIsInChatNavigationMode(true);
        finalEventRef.current?.focus();
      }
    },
    []
  );

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
      {showScrollToBottom && !isWaitingForChatResponse && (
        <ScrollToBottomButton scrollToBottom={scrollToBottom} />
      )}
      <div className={moduleStyles.messageArea} ref={containerRef}>
        {chatDisabled ? (
          <ChatDisabled message={chatDisabledMessage} />
        ) : (
          <>
            {events.map((event, index) => {
              const isLastMessage = index === events.length - 1;
              const isLastUserMessage = index === lastUserMessageIndex;
              return (
                <ChatEventView
                  event={event}
                  key={event.timestamp}
                  isTeacherView={isTeacherView}
                  buildAssetUrl={buildAssetUrl}
                  isAiTutorVersion={isAiTutorVersion}
                  isLastMessage={isLastMessage}
                  ref={element => {
                    if (isLastUserMessage) {
                      lastUserMessageRef.current = element;
                    }
                    if (isLastMessage) {
                      finalEventRef.current = element;
                    }
                  }}
                  tabIndex={isInChatNavigationMode ? 0 : -1}
                  onKeyDown={handleItemKeyDown}
                />
              );
            })}
            <WaitingAnimation shouldDisplay={isWaitingForChatResponse} />
            <Spacer ref={spacerRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatEventsList;

const Spacer = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className={moduleStyles.scrollSpacer} />
));

const ScrollToBottomButton: FC<{scrollToBottom: () => void}> = ({
  scrollToBottom,
}) => (
  <div className={moduleStyles.floatingScrollToBottomButtonContainer}>
    <Button
      isIconOnly
      icon={{iconName: 'arrow-down'}}
      size="xs"
      color="black"
      type="secondary"
      onClick={() => scrollToBottom()}
      className={moduleStyles.scrollToBottomButton}
      ariaLabel="Scroll to bottom of messages"
      aria-controls="chat-workspace-conversation"
    />
  </div>
);
