import React from 'react';
import {useSelector} from 'react-redux';

import Button from '@cdo/apps/templates/Button';
import {AichatState} from '@cdo/apps/aichat/redux/aichatRedux';

const copyToClipboard = require('@cdo/apps/util/copyToClipboard');

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
      key="copy"
      onClick={() => handleCopy()}
      size={Button.ButtonSize.small}
      text="Copy Conversation History"
    />
  );
};

export default CopyButton;
