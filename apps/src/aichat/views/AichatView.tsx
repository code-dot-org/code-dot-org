// AichatView
//
// This is a React client for an aichat level.

import React from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatWorkspace from './ChatWorkspace';
import moduleStyles from './aichat.module.scss';

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat" className={moduleStyles.aichat}>
      {/* <div id="chat-instructions-area" className={moduleStyles.instructions}>
        <PanelContainer id="chat-instructions-panel" headerText="Instructions">
          <Instructions />
        </PanelContainer>
      </div> */}
      <div id="chat-workspace-area" className={moduleStyles.chatArea}>
        <PanelContainer id="chat-workspace-panel" headerText="AI Chat">
          <ChatWorkspace />
        </PanelContainer>
      </div>
    </div>
  );
};

export default AichatView;
