import React from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {modelDescriptions} from '../constants';
import aichatI18n from '../locale';
import {removeUpdateMessage} from '../redux/aichatRedux';
import {timestampToLocalTime} from '../redux/utils';
import {
  ChatEvent,
  ModelUpdate,
  isChatMessage,
  isNotification,
  isModelUpdate,
  ChatEventDescriptionKey,
} from '../types';

import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';

import styles from './chatWorkspace.module.scss';

const ChatEventDescriptions = {
  COPY_CHAT: aichatI18n.chatEventDescriptions_copyChat(),
  CLEAR_CHAT: aichatI18n.chatEventDescriptions_clearChat(),
  LOAD_LEVEL: aichatI18n.chatEventDescriptions_loadLevel(),
} as const satisfies {[key in ChatEventDescriptionKey]: string};

interface ChatEventViewProps {
  event: ChatEvent;
  isTeacherView?: boolean;
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
}) => {
  const dispatch = useAppDispatch();

  if (isChatMessage(event)) {
    return (
      <ChatMessage {...event} showProfaneUserMessageToggle={isTeacherView} />
    );
  }

  if (isNotification(event)) {
    const {id, text, notificationType, timestamp} = event;
    return (
      <Alert
        text={`${text} ${timestampToLocalTime(timestamp)}`}
        type={
          ['error', 'permissionsError'].includes(notificationType)
            ? 'danger'
            : 'success'
        }
        onClose={
          isTeacherView ? undefined : () => dispatch(removeUpdateMessage(id))
        }
        link={
          notificationType === 'permissionsError'
            ? {
                href: 'https://support.code.org/hc/en-us/articles/30162711193741-AI-Chat-Lab-FAQ',
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
            : () => dispatch(removeUpdateMessage(event.id))
        }
      />
    );
  }

  if (event.descriptionKey) {
    return (
      <Alert
        text={ChatEventDescriptions[event.descriptionKey] as string}
        type="info"
        size="s"
      />
    );
  }

  return null;
};

export default ChatEventView;
