import React from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatItems/ChatMessage';
import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {modelDescriptions} from '../constants';
import {removeUpdateMessage} from '../redux/aichatRedux';
import {timestampToLocalTime} from '../redux/utils';
import {
  ChatItem,
  ModelUpdate,
  isChatMessage,
  isNotification,
  isModelUpdate,
} from '../types';

import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';

interface ChatItemViewProps {
  item: ChatItem;
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
 * Renders AI Chat {@link ChatItem}s using common AI design components.
 */
const ChatItemView: React.FunctionComponent<ChatItemViewProps> = ({item}) => {
  const dispatch = useAppDispatch();

  if (isChatMessage(item)) {
    return <ChatMessage {...item} />;
  }

  if (isNotification(item)) {
    const {id, text, notificationType, timestamp} = item;
    return (
      <Alert
        text={`${text} ${timestampToLocalTime(timestamp)}`}
        type={notificationType === 'error' ? 'danger' : 'success'}
        onClose={() => dispatch(removeUpdateMessage(id))}
        size="s"
      />
    );
  }

  if (isModelUpdate(item)) {
    return (
      <Alert
        text={formatModelUpdateText(item)}
        type="success"
        onClose={() => dispatch(removeUpdateMessage(item.id))}
        size="s"
      />
    );
  }

  return null;
};

export default ChatItemView;
