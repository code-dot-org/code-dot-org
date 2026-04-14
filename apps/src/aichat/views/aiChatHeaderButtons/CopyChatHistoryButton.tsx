import React from 'react';

import {selectAllVisibleMessages, sendAnalytics} from '@cdo/apps/aichat/redux';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {timestampToDateTime} from '../../redux/utils';
import {
  ChatEvent,
  ChatEventDescriptionKey,
  isChatMessage,
  isModelUpdate,
  isNotification,
  isUserActionEvent,
  WorkspaceTeacherViewTab,
} from '../../types';
import {AI_CUSTOMIZATIONS_LABELS} from '../modelCustomization/constants';

const CopyChatHistoryButton: React.FunctionComponent = () => {
  const visibleMessages = useAppSelector(selectAllVisibleMessages);
  const studentChatHistory = useAppSelector(
    state => state.aichat.studentChatHistory
  );
  const selectedTab = useAppSelector(
    state => state.aichat.chatWorkspaceSelectedTab
  );
  const isViewingStudentHistory =
    selectedTab === WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY;
  const messages = isViewingStudentHistory
    ? studentChatHistory
    : visibleMessages;
  const dispatch = useAppDispatch();

  const handleCopy = () => {
    const textToCopy = messages.map(chatEventToFormattedString).join('\n');
    copyToClipboard(
      textToCopy,
      () => alert('Text copied to clipboard'),
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
      label={'Copy chat'}
      icon={{iconName: 'copy', iconStyle: 'solid'}}
      variant="text"
      color="tertiary"
      size="extraSmall"
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
        ? '[FLAGGED AS PROFANITY]'
        : chatEvent.chatMessageText
    }`;
  }

  if (isModelUpdate(chatEvent)) {
    return `[${formattedTimestamp} - Model Update] ${AI_CUSTOMIZATIONS_LABELS[
      chatEvent.updatedField
    ]!} updated.`;
  }

  if (isNotification(chatEvent)) {
    return `[${formattedTimestamp} - Notification] ${chatEvent.text}`;
  }

  if (isUserActionEvent(chatEvent)) {
    const descriptions: {[key in ChatEventDescriptionKey]: string} = {
      CLEAR_CHAT: 'The user cleared the chat workspace.',
      LOAD_LEVEL: 'The user loaded the level.',
    };
    return `[${formattedTimestamp} - User Action] ${
      descriptions[chatEvent.descriptionKey]
    }`;
  }
}

export default CopyChatHistoryButton;
