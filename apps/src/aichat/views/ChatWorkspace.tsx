import React, {useCallback} from 'react';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {useSelector} from 'react-redux';
import ChatWarningModal from '@cdo/apps/aichat/views/ChatWarningModal';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import {ChatCompletionMessage, Status, Role} from '../types';
import {getChatCompletionMessage} from '../chatApi';
import {
  AichatState,
  setIsWaitingForChatResponse,
  addChatMessage,
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

  const dispatch = useAppDispatch();

  const onCloseWarningModal = useCallback(
    () => dispatch(setShowWarningModal(false)),
    [dispatch]
  );

  // This function is called when the user submits a chat message.
  // It sends the user message to the backend and retrieves the assistant response.
  const onSubmit = async (message: string, systemPrompt: string) => {
    dispatch(setIsWaitingForChatResponse(true));
    const newMessageId =
      storedMessages.length === 0
        ? 1
        : storedMessages[storedMessages.length - 1].id + 1;

    // TODO: Ask product about how to display user message with status unknown while message is being sent to backend.

    const appropriateChatMessages = storedMessages.filter(
      msg => msg.status === Status.OK
    );

    // Send user message to backend and retrieve assistant response.
    const chatApiResponse = await getChatCompletionMessage(
      systemPrompt,
      newMessageId,
      message,
      appropriateChatMessages
    );
    dispatch(setIsWaitingForChatResponse(false));

    // Add user chat messages to chatMessages.
    const newMessage: ChatCompletionMessage = {
      id: chatApiResponse.id,
      role: Role.USER,
      status: chatApiResponse.status,
      chatMessageText: message,
    };
    dispatch(addChatMessage(newMessage));

    // Add assistant chat messages to chatMessages.
    if (chatApiResponse.assistantResponse) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: chatApiResponse.id + 1,
        role: Role.ASSISTANT,
        status: Status.OK,
        chatMessageText: chatApiResponse.assistantResponse,
      };
      dispatch(addChatMessage(assistantChatMessage));
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
