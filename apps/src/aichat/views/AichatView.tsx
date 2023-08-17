/** @file Top-level view for AI Chat Lab */

import React from 'react';
import moduleStyles from './aichatView.module.scss';
import ChatWorkspace from './ChatWorkspace';

const AichatView: React.FunctionComponent = () => {
  return (
    <div id="aichat-lab" className={moduleStyles.aichatLab}>
      <ChatWorkspace />
    </div>
  );
};

export default AichatView;
