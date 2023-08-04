import React, {useState} from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import aichatI18n from '../locale';
import {ChatCompletionMessage} from '../types';
import {Role, Status} from '../constants';
import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend
import {openaiCompletion} from '../openai';

const ChatWorkspace: React.FunctionComponent = () => {
  const [storedMessages, setStoredMessages] =
    useState<ChatCompletionMessage[]>(demoChatMessages);

  const onSubmit = async (message: string) => {
    let lastMessageID =
      storedMessages.length === 0
        ? 1
        : storedMessages[storedMessages.length - 1].id;

    const newMessage: ChatCompletionMessage = {
      id: lastMessageID + 1,
      name: 'User', // Get name from signed in user.
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: message,
    };
    lastMessageID++;

    // Retrieve system prompt from levebuilder - assign for now.
    const systemPrompt =
      'You are a chatbot for a middle school classroom where they can chat with a historical figure. You must answer only questions about the formation of America and the founding fathers. You will act as George Washington; every question you answer must be from his perspective. Wait for the student to ask a question before responding.';

    const systemPromptMessage: ChatCompletionMessage = {
      id: 0,
      name: 'System',
      role: Role.SYSTEM,
      chatMessageText: systemPrompt,
      status: Status.OK,
    };

    const messagesToSend = [systemPromptMessage];
    // TODO: Filter out messages that are inappropriate or too personal in messagesToSend.
    storedMessages.forEach(message => messagesToSend.push(message));
    messagesToSend.push(newMessage);
    const response = await openaiCompletion(messagesToSend);

    // TODO: Check if response was successful. Update user message status accordingly.
    newMessage.status = Status.OK;
    const assistantMessage = response.content;

    // TODO: If user message was inappropriate or too personal, update status.
    const assistantChatMessage: ChatCompletionMessage = {
      id: lastMessageID + 1,
      name: 'HistoryBot',
      role: Role.ASSISTANT,
      status: Status.OK,
      chatMessageText: assistantMessage,
    };

    setStoredMessages([...storedMessages, newMessage, assistantChatMessage]);
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
