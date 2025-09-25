import React from 'react';

import ClearChatButton from './ClearChatButton';
import CopyChatHistoryButton from './CopyChatHistoryButton';

import moduleStyles from './aiChatHeaderButtons.module.scss';

interface AiChatHeaderButtonsProps {
  isCopyChatDisabled: boolean;
  isClearChatDisabled: boolean;
  getSelectedTab?: () => string | null;
}

const AiChatHeaderButtons: React.FunctionComponent<
  AiChatHeaderButtonsProps
> = ({isCopyChatDisabled, isClearChatDisabled, getSelectedTab}) => {
  return (
    <div className={moduleStyles.aiChatHeaderButtons}>
      <CopyChatHistoryButton />
      <ClearChatButton isDisabled={isClearChatDisabled} />
    </div>
  );
};

export default AiChatHeaderButtons;
