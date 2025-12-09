import React from 'react';

import ClearChatButton from './ClearChatButton';
import CopyChatHistoryButton from './CopyChatHistoryButton';

import moduleStyles from './aiChatHeaderButtons.module.scss';

const AiChatHeaderButtons: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.aiChatHeaderButtons}>
      <CopyChatHistoryButton />
      <ClearChatButton />
    </div>
  );
};

export default AiChatHeaderButtons;
