/** @file Top-level view for AI Chat Lab */

import React from 'react';
import moduleStyles from './aichatView.module.scss';
import ChatWorkspace from './ChatWorkspace';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
const commonI18n = require('@cdo/locale');
const aichatI18n = require('../locale');

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      <div className={moduleStyles.instructionsArea}>
        <PanelContainer
          id="aichat-instructions-panel"
          headerText={commonI18n.instructions()}
        >
          <Instructions />
        </PanelContainer>
      </div>
      <div className={moduleStyles.chatWorkspaceArea}>
        <PanelContainer
          id={aichatI18n.aichatWorkspaceHeader()}
          headerText="AI Chat Lab"
        >
          <ChatWorkspace />
        </PanelContainer>
      </div>
    </div>
  );
};

export default AichatView;
