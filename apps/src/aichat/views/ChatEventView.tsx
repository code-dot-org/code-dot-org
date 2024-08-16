import React from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import Alert, {AlertProps} from '@cdo/apps/componentLibrary/alert/Alert';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {modelDescriptions} from '../constants';
import {removeUpdateMessage} from '../redux/aichatRedux';
import {timestampToLocalTime} from '../redux/utils';
import {
  ChatEvent,
  ChatEventDescriptions,
  ModelUpdate,
  isChatMessage,
  isNotification,
  isModelUpdate,
} from '../types';

import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';

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

  const updatedText = updatedToText
    ? ` has been updated to ${updatedToText}.`
    : ' has been updated.';

  return `${fieldLabel} ${updatedText} ${timestampToLocalTime(timestamp)}`;
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
    const {chatMessageText, role, status} = event;
    return (
      <ChatMessage
        chatMessageText={chatMessageText}
        role={role}
        status={status}
        isTeacherView={isTeacherView}
      />
    );
  }

  if (isNotification(event)) {
    const {id, text, notificationType, timestamp} = event;
    const alertArgs: AlertProps = {
      text: `${text} ${timestampToLocalTime(timestamp)}`,
      type: notificationType === 'error' ? 'danger' : 'success',
      size: 's',
    };
    if (!isTeacherView) {
      alertArgs.onClose = () => dispatch(removeUpdateMessage(id));
    }
    return <Alert {...alertArgs} />;
  }

  if (isModelUpdate(event)) {
    const alertArgs: AlertProps = {
      text: formatModelUpdateText(event),
      type: 'success',
      size: 's',
    };
    if (!isTeacherView) {
      alertArgs.onClose = () => dispatch(removeUpdateMessage(event.id));
    }
    return <Alert {...alertArgs} />;
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
