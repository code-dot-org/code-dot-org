import React, {useCallback, useRef, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {
  AichatState,
  selectAllMessages,
  setShowWarningModal,
} from '@cdo/apps/aichat/redux/aichatRedux';
import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import ChatItemView from './ChatItemView';
import UserChatMessageEditor from './UserChatMessageEditor';

import moduleStyles from './chatWorkspace.module.scss';

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent = () => {
  const showWarningModal = useSelector(
    (state: {aichat: AichatState}) => state.aichat.showWarningModal
  );

  const items = useSelector(selectAllMessages);

  const isWaitingForChatResponse = useSelector(
    (state: {aichat: AichatState}) => state.aichat.isWaitingForChatResponse
  );

  // Compare the messages as a string since the object reference will change on every update.
  // This way we will only scroll when the contents of the messages have changed.
  const messagesString = JSON.stringify(items);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTo({
        top: conversationContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messagesString, isWaitingForChatResponse]);

  const dispatch = useAppDispatch();

  const onCloseWarningModal = useCallback(
    () => dispatch(setShowWarningModal(false)),
    [dispatch]
  );

  const showWaitingAnimation = () => {
    if (isWaitingForChatResponse) {
      return (
        <img
          src="/blockly/media/aichat/typing-animation.gif"
          alt={'Waiting for response'}
          className={moduleStyles.waitingForResponse}
        />
      );
    }
  };

  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      {showWarningModal && <ChatWarningModal onClose={onCloseWarningModal} />}
      <div
        id="chat-workspace-conversation"
        className={moduleStyles.conversationArea}
        ref={conversationContainerRef}
      >
        {items.map((item, index) => (
          <ChatItemView item={item} key={index} />
        ))}
        {showWaitingAnimation()}
      </div>
      <UserChatMessageEditor />
    </div>
  );
};

export default ChatWorkspace;
