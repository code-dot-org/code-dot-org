import React, {useCallback} from 'react';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {useSelector} from 'react-redux';
import ChatWarningModal from '@cdo/apps/aichat/views/ChatWarningModal';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import {
  AichatState,
  setShowWarningModal,
} from '@cdo/apps/aichat/redux/aichatRedux';

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent = () => {
  const showWarningModal = useSelector(
    (state: {aichat: AichatState}) => state.aichat.showWarningModal
  );

  const storedMessages = useSelector(
    (state: {aichat: AichatState}) => state.aichat.chatMessages
  );

  const isWaitingForChatResponse = useSelector(
    (state: {aichat: AichatState}) => state.aichat.isWaitingForChatResponse
  );

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
      >
        {storedMessages.map(message => (
          <ChatMessage message={message} key={message.id} />
        ))}
        {showWaitingAnimation()}
      </div>
      <UserChatMessageEditor />
    </div>
  );
};

export default ChatWorkspace;
