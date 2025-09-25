import React from 'react';

import ClearChatButton from './ClearChatButton';
import CopyChatHistoryButton from './CopyChatHistoryButton';

import moduleStyles from './aiChatHeaderButtons.module.scss';

interface AiChatHeaderButtonsProps {
  isCopyChatDisabled: boolean;
  isClearChatDisabled: boolean;
}

const AiChatHeaderButtons: React.FunctionComponent<
  AiChatHeaderButtonsProps
> = ({isCopyChatDisabled, isClearChatDisabled}) => {
  return (
    <div className={moduleStyles.aiChatHeaderButtons}>
      <CopyChatHistoryButton isDisabled={isCopyChatDisabled} />
      <ClearChatButton isDisabled={isClearChatDisabled} />
    </div>
  );
};

export default AiChatHeaderButtons;
