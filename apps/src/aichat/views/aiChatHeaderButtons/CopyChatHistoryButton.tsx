import React from 'react';
import {useSelector} from 'react-redux';

import {selectAllVisibleMessages, sendAnalytics} from '@cdo/apps/aichat/redux';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../../locale';
import {timestampToDateTime} from '../../redux/utils';
import {
  ChatEvent,
  isChatMessage,
  isModelUpdate,
  isNotification,
} from '../../types';
import {AI_CUSTOMIZATIONS_LABELS} from '../modelCustomization/constants';

const CopyChatHistoryButton: React.FunctionComponent = () => {
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
  };

  return (
    <IconButtonWithTooltip
      id="copy-chat"
      label={aichatI18n.copyChatButtonText()}
      icon={{iconName: 'copy', iconStyle: 'solid'}}
      type="tertiary"
      color="gray"
      buttonSize="xs"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={true}
      onClick={handleCopy}
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

export default CopyChatHistoryButton;
