import React, {useCallback, useEffect} from 'react';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {useSelector} from 'react-redux';
import ChatWarningModal from '@cdo/apps/aichat/views/ChatWarningModal';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import {
  AichatState,
  clearChatMessages,
  setShowWarningModal,
} from '@cdo/apps/aichat/redux/aichatRedux';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';

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

  const dispatch = useAppDispatch();

  const onCloseWarningModal = useCallback(
    () => dispatch(setShowWarningModal(false)),
    [dispatch]
  );

  const currentLevelId = useSelector(
    (state: {progress: ProgressState}) => state.progress.currentLevelId
  );

  // When the level changes, clear the chat message history.
  useEffect(() => {
    dispatch(clearChatMessages());
  }, [currentLevelId, dispatch]);

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
      </div>
      <div
        id="chat-workspace-editor"
        className={moduleStyles.userChatMessageEditor}
      >
        <UserChatMessageEditor />
      </div>
    </div>
  );
};

export default ChatWorkspace;
