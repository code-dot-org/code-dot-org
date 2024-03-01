import React from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import Button from '@cdo/apps/templates/Button';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

const CopyButton: React.FunctionComponent = () => {
  const storedMessages = useAppSelector(state => state.aiTutor.chatMessages);

  const handleCopy = () => {
    const textToCopy = storedMessages
      .map(
        message =>
          `[${message.timestamp || 'XXXX-XX-XX XX:XX'} - ${message.role}] ${
            message.chatMessageText
          }`
      )
      .join('\n');
    copyToClipboard(
      textToCopy,
      () => alert('Text copied to clipboard'),
      () => {
        console.error('Error in copying text');
      }
    );
  };

  return (
    <Button
      color={Button.ButtonColor.white}
      icon={'clipboard'}
      key="copy"
      onClick={() => handleCopy()}
      size={Button.ButtonSize.small}
      text="Copy Conversation History"
    />
  );
};

export default CopyButton;
