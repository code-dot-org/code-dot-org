import React from 'react';
import {useSelector} from 'react-redux';

import Button from '@cdo/apps/templates/Button';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {AichatState} from '@cdo/apps/aichat/redux/aichatRedux';

const CopyButton: React.FunctionComponent = () => {
  const storedMessages = useSelector(
    (state: {aichat: AichatState}) => state.aichat.chatMessages
  );

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
