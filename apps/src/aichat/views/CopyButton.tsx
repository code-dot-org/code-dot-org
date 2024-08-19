import React from 'react';
import {useSelector} from 'react-redux';

import {selectAllVisibleMessages} from '@cdo/apps/aichat/redux/aichatRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {timestampToDateTime} from '../redux/utils';
import {
  ChatEvent,
  isChatMessage,
  isModelUpdate,
  isNotification,
} from '../types';

import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';

const CopyButton: React.FunctionComponent = () => {
  const messages = useSelector(selectAllVisibleMessages);

  const handleCopy = () => {
    const textToCopy = messages.map(chatEventToFormattedString).join('\n');
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

function chatEventToFormattedString(chatEvent: ChatEvent) {
  const formattedTimestamp = timestampToDateTime(chatEvent.timestamp);
  if (isChatMessage(chatEvent)) {
    return `[${formattedTimestamp} - ${chatEvent.role}] ${
      chatEvent.status === Status.PROFANITY_VIOLATION
        ? '[FLAGGED AS PROFANITY]'
        : chatEvent.chatMessageText
    }`;
  }

  if (isModelUpdate(chatEvent)) {
    return `[${formattedTimestamp} - Model Update] ${
      AI_CUSTOMIZATIONS_LABELS[chatEvent.updatedField]
    } updated.`;
  }

  if (isNotification(chatEvent)) {
    return `[${formattedTimestamp} - Notification] ${chatEvent.text}`;
  }
}

export default CopyButton;
