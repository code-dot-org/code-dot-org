import React from 'react';
import {useSelector} from 'react-redux';

import {selectAllMessages} from '@cdo/apps/aichat/redux/aichatRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {timestampToDateTime} from '../redux/utils';
import {ChatItem, isChatMessage, isModelUpdate, isNotification} from '../types';

import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';

const CopyButton: React.FunctionComponent = () => {
  const messages = useSelector(selectAllMessages);

  const handleCopy = () => {
    const textToCopy = messages.map(chatItemToFormattedString).join('\n');
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
      text="Copy chat"
      iconLeft={{iconName: 'clipboard'}}
      size="s"
      color="gray"
      type="secondary"
    />
  );
};

function chatItemToFormattedString(chatItem: ChatItem) {
  const formattedTimestamp = timestampToDateTime(chatItem.timestamp);
  if (isChatMessage(chatItem)) {
    return `[${formattedTimestamp} - ${chatItem.role}] ${
      chatItem.status === Status.PROFANITY_VIOLATION
        ? '[FLAGGED AS PROFANITY]'
        : chatItem.chatMessageText
    }`;
  }

  if (isModelUpdate(chatItem)) {
    return `[${formattedTimestamp} - Model Update] ${
      AI_CUSTOMIZATIONS_LABELS[chatItem.updatedField]
    } updated.`;
  }

  if (isNotification(chatItem)) {
    return `[${formattedTimestamp} - Notification] ${chatItem.text}`;
  }
}

export default CopyButton;
