import React from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatMessage from './ChatMessage';
import UserChatMessageEditor from './UserChatMessageEditor';
import moduleStyles from './chatWorkspace.module.scss';
import classNames from 'classnames';
import aichatI18n from '../locale';

import {demoChatMessages} from './demoMessages'; // demo chat messages - remove when connected to backend

const botImagePath = `/blockly/media/aichat/ai-bot-default.svg`;
const hand0ImagePath = `/blockly/media/aichat/ai-bot-hand-0.png`;
const hand1ImagePath = `/blockly/media/aichat/ai-bot-hand-1.png`;
const foot0ImagePath = `/blockly/media/aichat/ai-bot-foot-0.png`;
const foot1ImagePath = `/blockly/media/aichat/ai-bot-foot-1.png`;

const ChatWorkspace: React.FunctionComponent = () => {
  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      <div id="dancing-bot" className={moduleStyles.dancingBot}>
        <img
          src={botImagePath}
          className={classNames(
            moduleStyles.botImage,
            moduleStyles.verticalShake
          )}
        />
        <img
          src={hand0ImagePath}
          className={classNames(moduleStyles.hand0Image, moduleStyles.shake)}
        />
        <img
          src={hand1ImagePath}
          className={classNames(moduleStyles.hand1Image, moduleStyles.shake)}
        />
        <img
          src={foot0ImagePath}
          className={classNames(
            moduleStyles.foot0Image,
            moduleStyles.angleShake
          )}
        />
        <img
          src={foot1ImagePath}
          className={classNames(moduleStyles.foot1Image)}
        />
      </div>
      <PanelContainer
        id="chat-workspace-panel"
        headerText={aichatI18n.aichatWorkspaceHeader()}
      >
        <div
          id="chat-workspace-conversation"
          className={moduleStyles.conversationArea}
        >
          {demoChatMessages.map(message => (
            <ChatMessage chatMessage={message} />
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
  );
};
export default ChatWorkspace;
