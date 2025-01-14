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
  const [atBottomOfContent, setAtBottomofContent] = useState(true);
  const {isWaitingForChatResponse} = useAppSelector(state => state.aichat);

  // Compare the chat events  as a string since the object reference will change on every update.
  // This way we will only scroll when the contents of the events have changed.
  const eventsString = JSON.stringify(events);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  const events2 = [
    {
      timestamp: 1627584000000,
      chatMessageText: 'Hello',
      role: 'user',
      status: 'ok',
      requestId: 1,
    },
    {
      timestamp: 1627584000001,
      chatMessageText:
        '"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"',
      role: 'assistant',
      status: 'ok',
      requestId: 2,
    },
    {
      timestamp: 1627584000003,
      chatMessageText: 'Hello',
      role: 'user',
      status: 'ok',
      requestId: 3,
    },
    {
      timestamp: 1627584000004,
      chatMessageText:
        '"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"',
      role: 'assistant',
      status: 'ok',
      requestId: 4,
    },
  ];

  const scrollToBottom = () => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTo({
        top: conversationContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const container = conversationContainerRef.current;

    const handleScroll = () => {
      if (container) {
        console.log(`scrollTop: ${container.scrollTop}`);
        console.log(`clientHeight: ${container.clientHeight}`);
        console.log(`scrollHeight: ${container.scrollHeight}`);
        const isAtBottom =
          container.scrollTop + container.clientHeight + 1 >=
          container.scrollHeight;

        setAtBottomofContent(isAtBottom);
      }
    };

    container?.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(scrollToBottom, [eventsString, isWaitingForChatResponse]);

  return (
    <div
      id="chat-workspace-conversation"
      style={{position: 'relative', width: '100%', height: '100%'}}
      className={moduleStyles.conversationArea}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          padding: 16,
        }}
        className={moduleStyles.messageArea}
        ref={conversationContainerRef}
      >
        {events2.map(event => (
          <ChatEventView
            event={event}
            key={event.timestamp}
            isTeacherView={isTeacherView}
          />
        ))}
        <WaitingAnimation shouldDisplay={isWaitingForChatResponse} />
      </div>
      {!atBottomOfContent && (
        <div
          style={{display: 'flex', justifyContent: 'center', width: '100%'}}
          className={moduleStyles.floatingScrollToBottomButton}
        >
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
