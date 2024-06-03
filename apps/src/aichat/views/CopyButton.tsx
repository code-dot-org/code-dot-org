import React from 'react';
import {useSelector} from 'react-redux';

import Button from '@cdo/apps/componentLibrary/button/Button';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {selectAllMessages} from '@cdo/apps/aichat/redux/aichatRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';

const CopyButton: React.FunctionComponent = () => {
  const messages = useSelector(selectAllMessages);

  const handleCopy = () => {
    const textToCopy = messages
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
    analyticsReporter.sendEvent(
      EVENTS.CHAT_ACTION,
      {
        action: 'Copy chat history',
      },
      PLATFORMS.BOTH
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
