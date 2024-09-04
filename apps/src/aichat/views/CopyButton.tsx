import React from 'react';
import {useSelector} from 'react-redux';

import {
  selectAllVisibleMessages,
  addChatEvent,
} from '@cdo/apps/aichat/redux/aichatRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {timestampToDateTime} from '../redux/utils';
import {
  AichatAccess,
  ChatEvent,
  isChatMessage,
  isModelUpdate,
  isNotification,
} from '../types';

import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';

const CopyButton: React.FunctionComponent = () => {
  const messages = useSelector(selectAllVisibleMessages);
  const dispatch = useAppDispatch();
  const userHasAichatAccess = useAppSelector(
    state => state.aichat.userHasAichatAccess
  );

  const handleCopy = () => {
    const textToCopy = messages.map(chatEventToFormattedString).join('\n');
    copyToClipboard(
      textToCopy,
      () => alert('Text copied to clipboard'),
      () => {
        console.error('Error in copying text');
      }
    );
    if (userHasAichatAccess === AichatAccess.YES) {
      analyticsReporter.sendEvent(
        EVENTS.CHAT_ACTION,
        {
          action: 'Copy chat history',
        },
        PLATFORMS.BOTH
      );
    }
    dispatch(
      addChatEvent({
        timestamp: Date.now(),
        descriptionKey: 'COPY_CHAT',
        hideForParticipants: true,
      })
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
