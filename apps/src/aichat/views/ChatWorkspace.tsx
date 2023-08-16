import React, {useState} from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import aichatI18n from '../locale';
import {ChatCompletionMessage, Status, Role} from '../types';
import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend
import {getChatCompletionMessage} from '../chatApi';

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent = () => {
  const [storedMessages, setStoredMessages] =
    useState<ChatCompletionMessage[]>(demoChatMessages);

  // This function is called when the user submits a chat message.
  // It sends the user message to the backend and retrieves the assistant response.
  const onSubmit = async (message: string) => {
    const newMessageId =
      storedMessages.length === 0
        ? 1
        : storedMessages[storedMessages.length - 1].id + 1;

    // TODO: Post user message with status unknown while message is being sent to backend.

    // TODO: Filter inappropriate and too personal messages.
    const appropriateChatMessages = [...storedMessages];
    // Retrieve system prompt from levebuilder - assign for now.
    const systemPrompt =
      'You are a chatbot for a middle school classroom where they can chat with a historical figure. You must answer only questions about the formation of America and the founding fathers. You will act as George Washington; every question you answer must be from his perspective. Wait for the student to ask a question before responding.';

    // Send user message to backend and retrieve assistant response.
    const chatApiResponse = await getChatCompletionMessage(
      systemPrompt,
      newMessageId,
      message,
      appropriateChatMessages
    );

    // Add user chat messages to newMessages.
    let newMessages: ChatCompletionMessage[] = [
      {
        id: chatApiResponse.id,
        role: Role.USER,
        status: chatApiResponse.status,
        chatMessageText: message,
      },
    ];

    // Add assistant chat messages to newMessages.
    if (chatApiResponse.assistantResponse) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: chatApiResponse.id + 1,
        role: Role.ASSISTANT,
        status: Status.OK,
        chatMessageText: chatApiResponse.assistantResponse,
      };
      newMessages = [...newMessages, assistantChatMessage];
    }
    setStoredMessages([...storedMessages, ...newMessages]);
  };

  return (
    <ChatWorkspaceContext.Provider value={{onSubmit: onSubmit}}>
      <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
        <PanelContainer
          id="chat-workspace-panel"
          headerText={aichatI18n.aichatWorkspaceHeader()}
        >
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
        </PanelContainer>
      </div>
    </ChatWorkspaceContext.Provider>
  );
};

type ChatUtils = {onSubmit: (message: string) => void};
export const ChatWorkspaceContext: React.Context<ChatUtils | null> =
  React.createContext<ChatUtils | null>(null);

export default ChatWorkspace;
