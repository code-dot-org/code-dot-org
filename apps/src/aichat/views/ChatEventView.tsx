import Alert from '@code-dot-org/component-library/alert';
import React, {memo} from 'react';

import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {FAQ_LINK, modelDescriptions} from '../constants';
import aichatI18n from '../locale';
import {removeUpdateMessage} from '../redux';
import {timestampToLocalTime} from '../redux/utils';
import {
  ChatEvent,
  ModelUpdate,
  isChatMessage,
  isNotification,
  isModelUpdate,
  ChatEventDescriptionKey,
  ChatAsset,
} from '../types';

import ChatMessageView from './ChatMessageView';
import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';

import styles from './chatWorkspace.module.scss';

const chatEventDescriptionsOwner = {
  CLEAR_CHAT: aichatI18n.chatEventDescriptions_clearChatOwner(),
  LOAD_LEVEL: aichatI18n.chatEventDescriptions_loadLevelOwner(),
} as const satisfies {[key in ChatEventDescriptionKey]: string};

const chatEventDescriptionsStudent = {
  CLEAR_CHAT: aichatI18n.chatEventDescriptions_clearChat(),
  LOAD_LEVEL: aichatI18n.chatEventDescriptions_loadLevel(),
} as const satisfies {[key in ChatEventDescriptionKey]: string};

interface ChatEventViewProps {
  event: ChatEvent;
  isTeacherView?: boolean;
  buildAssetUrl?: (asset: ChatAsset) => string;
}

function formatModelUpdateText(update: ModelUpdate): string {
  const {updatedField, updatedValue, timestamp} = update;
  const fieldLabel = AI_CUSTOMIZATIONS_LABELS[updatedField];

  let updatedToText = undefined;
  if (updatedField === 'temperature') {
    updatedToText = updatedValue as number;
  }
  if (updatedField === 'selectedModelId') {
    updatedToText = modelDescriptions.find(
      model => model.id === updatedValue
    )?.name;
  }

  const modelUpdateText = updatedToText
    ? aichatI18n.modelUpdateText({
        fieldLabel: fieldLabel,
        updatedText: updatedToText.toString(),
        timestamp: timestampToLocalTime(timestamp),
      })
    : aichatI18n.modelUpdateText2({
        fieldLabel: fieldLabel,
        timestamp: timestampToLocalTime(timestamp),
      });

  return modelUpdateText;
}

/**
 * Renders AI Chat {@link ChatEvent}s using common AI design components.
 */
const ChatEventView: React.FunctionComponent<ChatEventViewProps> = ({
  event,
  isTeacherView,
  buildAssetUrl,
}) => {
  const dispatch = useAppDispatch();

  const chatEventDescriptions = isTeacherView
    ? chatEventDescriptionsStudent
    : chatEventDescriptionsOwner;

  if (isChatMessage(event)) {
    return (
      <ChatMessageView
        chatMessage={event}
        isChatHistoryView={isTeacherView || false}
        buildAssetUrl={buildAssetUrl}
      />
    );
  }

  if (isNotification(event)) {
    const {removeId, text, notificationType, timestamp} = event;
    return (
      <Alert
        text={`${text} ${timestampToLocalTime(timestamp)}`}
        type={
          ['error', 'permissionsError'].includes(notificationType)
            ? 'danger'
            : 'success'
        }
        onClose={
          isTeacherView
            ? undefined
            : () => dispatch(removeUpdateMessage(removeId))
        }
        link={
          notificationType === 'permissionsError'
            ? {
                href: FAQ_LINK,
                text: commonI18n.learnMore(),
                className: styles.alertLink,
              }
            : undefined
        }
        size="s"
      />
    );
  }

  if (isModelUpdate(event)) {
    return (
      <Alert
        className="uitest-aichat-chat-alert"
        text={formatModelUpdateText(event)}
        type="success"
        size="s"
        onClose={
          isTeacherView
            ? undefined
            : () => dispatch(removeUpdateMessage(event.removeId))
        }
      />
    );
  }

  // Automatically narrowed to UserActionEvent
  return (
    <Alert
      text={chatEventDescriptions[event.descriptionKey]}
      type="info"
      size="s"
    />
  );
};

export default memo(ChatEventView);
