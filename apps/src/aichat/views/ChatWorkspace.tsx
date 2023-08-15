import React, {useState} from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import classNames from 'classnames';
import aichatI18n from '../locale';
import {ChatCompletionMessage} from '../types';
import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend
import {getChatCompletionMessage} from '../chatApi';

const botImagePath = `/blockly/media/aichat/ai-bot-default.svg`;
const hand0ImagePath = `/blockly/media/aichat/ai-bot-hand-0.png`;
const hand1ImagePath = `/blockly/media/aichat/ai-bot-hand-1.png`;
const foot0ImagePath = `/blockly/media/aichat/ai-bot-foot-0.png`;
const foot1ImagePath = `/blockly/media/aichat/ai-bot-foot-1.png`;

const ChatWorkspace: React.FunctionComponent = () => {
  const [storedMessages, setStoredMessages] =
    useState<ChatCompletionMessage[]>(demoChatMessages);

  const [danceState, setDanceState] = useState({
    shakeBody: false,
    shakeHands: false,
    tapFeet: false,
  });

  const onSubmit = async (message: string) => {
    const lastMessageId =
      storedMessages.length === 0
        ? 1
        : storedMessages[storedMessages.length - 1].id;

    // TODO: Filter inappropriate and too personal messages.
    const appropriateChatMessages = [...storedMessages];
    // Retrieve system prompt from levebuilder - assign for now.
    const systemPrompt =
      'You are a chatbot for a middle school classroom where they can chat with a dancing robot.  ' +
      'They will tell you how to dance, and you will respond with a JSON blob in the following ' +
      'format: {"shakeBody": true, "shakeHands": true, "tapFeet": true} but the values can ' +
      'vary depending on what the user asks you to do.';
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

    const responseText = updatedUserAndAssistantChatMessages[1].chatMessageText;
    const matches = responseText.match(/\{(.*?)\}/);
    if (matches) {
      const submatch = '{' + matches[1] + '}';
      const parsedDance = JSON.parse(submatch);
      setDanceState(parsedDance);
    }
  };

  return (
    <ChatWorkspaceContext.Provider value={{onSubmit: onSubmit}}>
      <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
        <PanelContainer
          id="chat-workspace-panel"
          headerText={aichatI18n.aichatWorkspaceHeader()}
        >
          <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
            <div id="dancing-bot" className={moduleStyles.dancingBot}>
              <img
                src={botImagePath}
                className={classNames(
                  moduleStyles.botImage,
                  danceState?.shakeBody && moduleStyles.verticalShake
                )}
              />
              <img
                src={hand0ImagePath}
                className={classNames(
                  moduleStyles.hand0Image,
                  danceState?.shakeHands && moduleStyles.shake
                )}
              />
              <img
                src={hand1ImagePath}
                className={classNames(
                  moduleStyles.hand1Image,
                  danceState?.shakeHands && moduleStyles.shake
                )}
              />
              <img
                src={foot0ImagePath}
                className={classNames(
                  moduleStyles.foot0Image,
                  danceState?.tapFeet && moduleStyles.angleShake
                )}
              />
              <img
                src={foot1ImagePath}
                className={classNames(moduleStyles.foot1Image)}
              />
            </div>
          </div>
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
