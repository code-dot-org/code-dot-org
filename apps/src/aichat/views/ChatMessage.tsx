import React from 'react';
import classNames from 'classnames';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import aiBotIcon from '@cdo/static/aichat/ai-bot-icon.svg';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {removeUpdateMessage} from '../redux/aichatRedux';
import {
  ChatItem,
  Notification,
  ModelUpdate,
  Role,
  isChatMessage,
  isNotification,
  isModelUpdate,
} from '../types';
import aichatI18n from '../locale';
import ChatNotificationMessage from './ChatNotificationMessage';
import moduleStyles from './chatMessage.module.scss';
import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';
import {modelDescriptions} from '../constants';
import {timestampToLocalTime} from '../redux/utils';

interface ChatMessageProps {
  message: ChatItem;
}

const INAPPROPRIATE_MESSAGE = aichatI18n.inappropriateUserMessage();
const TOO_PERSONAL_MESSAGE = aichatI18n.tooPersonalUserMessage();

const isAssistant = (role: string) => role === Role.ASSISTANT;
const isUser = (role: string) => role === Role.USER;

const displayUserMessage = (status: string, chatMessageText: string) => {
  if (
    status === Status.OK ||
    status === Status.UNKNOWN ||
    status === Status.ERROR
  ) {
    return (
      <div
        className={classNames(moduleStyles.message, moduleStyles.userMessage)}
      >
        {chatMessageText}
      </div>
    );
  } else if (status === Status.PROFANITY_VIOLATION) {
    return (
      <ChatNotificationMessage
        content={INAPPROPRIATE_MESSAGE}
        iconName="circle-xmark"
        iconClass={moduleStyles.danger}
        containerClass={moduleStyles.dangerContainer}
      />
    );
  } else if (status === Status.PII_VIOLATION) {
    return (
      <div
        className={classNames(
          moduleStyles.message,
          moduleStyles.tooPersonalMessage
        )}
      >
        {TOO_PERSONAL_MESSAGE}
      </div>
    );
  } else {
    return null;
  }
};

const displayAssistantMessage = (status: string, chatMessageText: string) => {
  if (status === Status.OK) {
    return (
      <div
        className={classNames(
          moduleStyles.message,
          moduleStyles.assistantMessage
        )}
      >
        <SafeMarkdown markdown={chatMessageText} />
      </div>
    );
  } else if (status === Status.ERROR) {
    return (
      <div
        className={classNames(
          moduleStyles.message,
          moduleStyles.assistantMessage,
          moduleStyles.dangerContainer
        )}
      >
        {'There was an error getting a response. Please try again.'}
      </div>
    );
  }
};

const displayModelUpdateMessage = (
  update: ModelUpdate,
  onRemove: () => void
) => {
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
    ? ' has been updated to '
    : ' has been updated.';

  return (
    <ChatNotificationMessage
      onRemove={onRemove}
      content={
        <>
          <span className={moduleStyles.modelUpdateMessageTextContainer}>
            <StrongText>{fieldLabel}</StrongText>
            {updatedText}
            {updatedToText && <StrongText>{updatedToText}</StrongText>}
          </span>
          <StrongText>{timestampToLocalTime(timestamp)}</StrongText>
        </>
      }
      iconName="check"
      iconClass={moduleStyles.check}
      containerClass={moduleStyles.modelUpdateContainer}
    />
  );
};

const displayNotification = (
  notification: Notification,
  onRemove: () => void
) => {
  const {text, notificationType, timestamp} = notification;
  return (
    <ChatNotificationMessage
      onRemove={onRemove}
      content={
        <>
          <span className={moduleStyles.modelUpdateMessageTextContainer}>
            <StrongText>{text}</StrongText>
          </span>
          <StrongText>{timestampToLocalTime(timestamp)}</StrongText>
        </>
      }
      iconName={notificationType === 'error' ? 'circle-xmark' : 'check'}
      iconClass={
        notificationType === 'error' ? moduleStyles.danger : moduleStyles.check
      }
      containerClass={
        notificationType === 'error'
          ? moduleStyles.dangerContainer
          : moduleStyles.modelUpdateContainer
      }
    />
  );
};

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({message}) => {
  const dispatch = useAppDispatch();

  return (
    <div>
      {isChatMessage(message) &&
        isUser(message.role) &&
        displayUserMessage(message.status, message.chatMessageText)}

      {isChatMessage(message) && isAssistant(message.role) && (
        <div className={moduleStyles.assistantMessageContainer}>
          <img src={aiBotIcon} alt="An icon depicting a robot" />
          {displayAssistantMessage(message.status, message.chatMessageText)}
        </div>
      )}

      {isModelUpdate(message) &&
        displayModelUpdateMessage(message, () =>
          dispatch(removeUpdateMessage(message.id))
        )}

      {isNotification(message) &&
        displayNotification(message, () =>
          dispatch(removeUpdateMessage(message.id))
        )}
    </div>
  );
};

export default ChatMessage;
