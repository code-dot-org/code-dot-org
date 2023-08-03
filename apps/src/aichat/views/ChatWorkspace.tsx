import React from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import aichatI18n from '../locale';
import {ChatCompletionMessage} from '../types';
import {Role, Status} from '../constants';
import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend
import {openaiCompletion} from '../openai';

const getStoredMessages = () => {
  // Retrieve messages from redux - use demoChatMessage for now.
  return demoChatMessages;
};

const onSubmit = async (name: string, message: string) => {
  console.log(`Submit button clicked with message: ${message}`);

  const storedMessages: ChatCompletionMessage[] = getStoredMessages();
  const lastMessageID =
    storedMessages.length === 0
      ? 1
      : storedMessages[storedMessages.length - 1].id;
  const newMessage: ChatCompletionMessage = {
    id: lastMessageID + 1,
    name,
    role: Role.USER,
    status: Status.UNKNOWN,
    chatMessageText: message,
  };

  storedMessages.push(newMessage);

  // Update storedMessages in redux
  console.log(storedMessages);

  // Retrieve system prompt from levebuilder - assigne for now.
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
  storedMessages.forEach(message => messagesToSend.push(message));
  console.log(messagesToSend);
  const response = await openaiCompletion(messagesToSend);
  console.log(response);
};

const ChatWorkspace: React.FunctionComponent = () => {
  const storedMessages = getStoredMessages();
  return (
    <ChatWorkspaceContext.Provider value={onSubmit}>
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

export const ChatWorkspaceContext: React.Context<typeof onSubmit> =
  React.createContext<typeof onSubmit>(onSubmit);

export default ChatWorkspace;
