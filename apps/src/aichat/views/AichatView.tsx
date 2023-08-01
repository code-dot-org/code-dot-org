// AichatView
//
// This is a React client for an aichat level.

import React from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatWorkspace from './ChatWorkspace';
import moduleStyles from './aichat.module.scss';

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      <div id="chat-workspace-area">
        <PanelContainer id="chat-workspace-panel" headerText="AI Chat">
          <ChatWorkspace />
        </PanelContainer>
      </div>
    </div>
  );
};

export default AichatView;
