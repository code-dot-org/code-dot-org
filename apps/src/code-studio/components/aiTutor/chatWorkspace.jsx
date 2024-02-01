import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import ChatMessage from './chatMessage';
import UserChatMessageEditor from './userChatMessageEditor';
import style from './ai-tutor.module.scss';

/**
 * Renders the AI Tutor main chat workspace component.
 */
const ChatWorkspace = ({levelId, isProjectBacked, scriptId}) => {
  const storedMessages = useSelector(state => state.aiTutor.chatMessages);
  const isWaitingForChatResponse = useSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const showWaitingAnimation = () => {
    if (isWaitingForChatResponse) {
      return (
        <img
          src="/blockly/media/aichat/typing-animation.gif"
          alt={'Waiting for response'}
          className={style.waitingForResponse}
        />
      );
    }
  };

  return (
    <div id="chat-workspace-area" className={style.chatWorkspace}>
      <div id="chat-workspace-conversation" className={style.conversationArea}>
        {storedMessages.map(message => (
          <ChatMessage message={message} key={message.id} />
        ))}
        {showWaitingAnimation()}
      </div>
      <div id="chat-workspace-editor" className={style.userChatMessageEditor}>
        <UserChatMessageEditor
          levelId={levelId}
          isProjectBacked={isProjectBacked}
          scriptId={scriptId}
        />
      </div>
    </div>
  );
};

export default ChatWorkspace;

ChatWorkspace.propTypes = {
  levelId: PropTypes.number,
  scriptId: PropTypes.number,
  isProjectBacked: PropTypes.bool,
};
