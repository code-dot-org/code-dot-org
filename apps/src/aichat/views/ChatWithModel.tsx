import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import {selectAllVisibleMessages} from '@cdo/apps/aichat/redux/aichatRedux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatEvent} from '../types';

import ChatEventView from './ChatEventView';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatWithModelProps {
  items: ChatEvent[];
  showWaitingAnimation: () => React.ReactNode;
}

/**
 * Renders AI Chat {@link ChatEvent}s using common AI design components.
 */
const ChatWithModel: React.FunctionComponent<ChatWithModelProps> = ({
  items,
  showWaitingAnimation,
}) => {
  const {isWaitingForChatResponse} = useAppSelector(state => state.aichat);
  const visibleItems = useSelector(selectAllVisibleMessages);
  // Compare the messages as a string since the object reference will change on every update.
  // This way we will only scroll when the contents of the messages have changed.
  const messagesString = JSON.stringify(visibleItems);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTo({
        top: conversationContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messagesString, isWaitingForChatResponse]);

  return (
    <div
      id="chat-workspace-conversation"
      className={moduleStyles.conversationArea}
      ref={conversationContainerRef}
    >
      {items.map(item => (
        <ChatEventView event={item} key={item.timestamp} />
      ))}
      {showWaitingAnimation()}
    </div>
  );
};

export default ChatWithModel;
