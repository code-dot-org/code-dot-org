import React from 'react';
import {useSelector} from 'react-redux';

import {Button} from '@cdo/component-library';
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
      onClick={handleCopy}
      text="Copy Chat"
      iconLeft={{iconName: 'clipboard'}}
      size="xs"
      color="white"
      type="secondary"
    />
  );
};

export default CopyButton;
