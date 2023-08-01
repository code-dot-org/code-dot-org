import React from 'react';
import ChatWorkspace from './ChatWorkspace';
import moduleStyles from './aichat.module.scss';

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
        <ChatWorkspace />
      </div>
    </div>
  );
};

export default AichatView;
