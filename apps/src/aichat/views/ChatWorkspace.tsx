import React, {useState} from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import aichatI18n from '../locale';
import {ChatCompletionMessage} from '../types';
import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend
import {getChatCompletionMessage} from '../chatApi';

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent = () => {
  const [storedMessages, setStoredMessages] =
    useState<ChatCompletionMessage[]>(demoChatMessages);

  const onSubmit = async (message: string) => {
    const lastMessageId =
      storedMessages.length === 0
        ? 1
        : storedMessages[storedMessages.length - 1].id;

    // TODO: Filter inappropriate and too personal messages.
    const appropriateChatMessages = [...storedMessages];
    // Retrieve system prompt from levebuilder - assign for now.
    const systemPrompt =
      'You are a chatbot for a middle school classroom where they can chat with a historical figure. You must answer only questions about the formation of America and the founding fathers. You will act as George Washington; every question you answer must be from his perspective. Wait for the student to ask a question before responding.';
    const updatedUserAndAssistantChatMessages = await getChatCompletionMessage(
      systemPrompt,
      lastMessageId,
      message,
      appropriateChatMessages
    );
    // If the returned array contains only one message, the user's message did not pass filters and
    // is returned without an assistant chat message.
    if (updatedUserAndAssistantChatMessages.length === 2) {
      // Update assistant chat message with appropriate name.
      updatedUserAndAssistantChatMessages[1].name = 'EduBot'; // TODO: assign name from levelbuilder settings.
    }
    setStoredMessages([
      ...storedMessages,
      ...updatedUserAndAssistantChatMessages,
    ]);
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
