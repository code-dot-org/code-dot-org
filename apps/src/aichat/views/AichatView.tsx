// AichatView
//
// This is a React client for an aichat level.

import React from 'react';
import Aichat from './Aichat';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ChatWorkspace from './ChatWorkspace';

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat">
      <Aichat>
        <PanelContainer id="chat-workspace" headerText="AI Chat">
          <ChatWorkspace />
        </PanelContainer>
      </Aichat>
    </div>
  );
};

export default AichatView;
