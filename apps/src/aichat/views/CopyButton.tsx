import Button from '@code-dot-org/component-library/button';
import React from 'react';
import {useSelector} from 'react-redux';

import {
  addChatEvent,
  selectAllVisibleMessages,
  sendAnalytics,
} from '@cdo/apps/aichat/redux/aichatRedux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../locale';
import {timestampToDateTime} from '../redux/utils';
import {
  ChatEvent,
  isChatMessage,
  isModelUpdate,
  isNotification,
} from '../types';

import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';

const CopyButton: React.FunctionComponent<{isDisabled: boolean}> = ({
  isDisabled,
}) => {
  const messages = useSelector(selectAllVisibleMessages);
  const dispatch = useAppDispatch();

  const handleCopy = () => {
    const textToCopy = messages.map(chatEventToFormattedString).join('\n');
    copyToClipboard(
      textToCopy,
      () => alert(aichatI18n.copyToClipboardAlert()),
      () => {
        console.error('Error in copying text');
      }
    );
    dispatch(
      sendAnalytics(EVENTS.CHAT_ACTION, {
        action: 'Copy chat history',
      })
    );

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
      text={aichatI18n.copyChatButtonText()}
      iconLeft={{iconName: 'clipboard'}}
      size="s"
      color="gray"
      type="secondary"
      disabled={isDisabled}
    />
  );
};

function chatEventToFormattedString(chatEvent: ChatEvent) {
  const formattedTimestamp = timestampToDateTime(chatEvent.timestamp);
  if (isChatMessage(chatEvent)) {
    return `[${formattedTimestamp} - ${chatEvent.role}] ${
      chatEvent.status === Status.PROFANITY_VIOLATION
        ? aichatI18n.copyChatContainsProfanity()
        : chatEvent.chatMessageText
    }`;
  }

  if (isModelUpdate(chatEvent)) {
    return aichatI18n.copyChatFormatting_modelUpdate({
      timestamp: formattedTimestamp,
      updatedFieldLabel: AI_CUSTOMIZATIONS_LABELS[chatEvent.updatedField],
    });
  }

  if (isNotification(chatEvent)) {
    return aichatI18n.copyChatFormatting_notification({
      timestamp: formattedTimestamp,
      chatEventText: chatEvent.text,
    });
  }
}

export default CopyButton;
