import Button from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatAsset, ChatEvent, isChatMessage} from '../types';

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
  const [inProgrammaticScroll, setInProgrammaticScroll] = useState(false);
  const [previousMessageRole, setPreviousMessageRole] = useState<Role>();
  const [showScrollToBottom, setShowScrollToBottom] = useState(true);
  const isWaitingForChatResponse = useAppSelector(
    state => !!state.aichat.chatMessagePending
  );

  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const scrollToLastMessage = useCallback(
    (keepLastMessageInView?: boolean) => {
      if (conversationContainerRef.current) {
        setShowScrollToBottom(false);

        if (!isAtBottom()) {
          setInProgrammaticScroll(true);

          if (keepLastMessageInView) {
            lastMessageRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          } else {
            conversationContainerRef.current.scrollTo({
              top: conversationContainerRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }

          const intervalId = setInterval(() => {
            if (isAtBottom()) {
              setInProgrammaticScroll(false);
              clearInterval(intervalId);
            }
          }, 100);
        }
      }
    },
    [conversationContainerRef]
  );

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

  useEffect(() => {
    const currentMessage = events.at(-1);
    let currentMessageRole: Role | undefined;
    if (currentMessage && isChatMessage(currentMessage)) {
      currentMessageRole = currentMessage.role;
    }

    // Heuristic to determine if we have an incoming assistant message and need to scroll only
    // to the top of the incoming message.  This logic avoids triggering this behavior when the
    // history is first loaded, which wouldn't be possible by just checking if the last message
    // is an assistant message.
    const isIncomingAssistantMessage =
      currentMessageRole === 'assistant' && previousMessageRole === 'user';
    scrollToLastMessage(isIncomingAssistantMessage);

    setPreviousMessageRole(currentMessageRole);
  }, [
    events,
    events.length,
    previousMessageRole,
    scrollToLastMessage,
    isWaitingForChatResponse,
  ]);

  return (
    <div
      id="chat-workspace-conversation"
      className={classNames(
        moduleStyles.conversationArea,
        moduleStyles.scrollToLastMessageContainer
      )}
    >
      <div className={moduleStyles.messageArea} ref={conversationContainerRef}>
        {chatDisabled ? (
          <ChatDisabled message={chatDisabledMessage} />
        ) : (
          <>
            {events.map((event, index) => (
              <div
                key={event.timestamp}
                className={moduleStyles.chatEventViewWrapper}
                ref={index === events.length - 1 ? lastMessageRef : null}
              >
                <ChatEventView
                  event={event}
                  isTeacherView={isTeacherView}
                  buildAssetUrl={buildAssetUrl}
                />
              </div>
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
            size="s"
            color="black"
            type="secondary"
            onClick={() => scrollToLastMessage()}
            className={moduleStyles.scrollToLastMessageButton}
          />
        </div>
      )}
    </div>
  );
};

export default ChatEventsList;
