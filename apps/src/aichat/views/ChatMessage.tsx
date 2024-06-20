import classNames from 'classnames';
import React from 'react';

import {StrongText} from '@cdo/apps/componentLibrary/typography';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotIcon from '@cdo/static/aichat/ai-bot-icon.svg';

import aichatI18n from '../locale';
import {removeUpdateMessage} from '../redux/aichatRedux';
import {ChatCompletionMessage, Role} from '../types';

import ChatNotificationMessage from './ChatNotificationMessage';

import moduleStyles from './chatMessage.module.scss';

interface ChatMessageProps {
  message: ChatCompletionMessage;
}

const INAPPROPRIATE_MESSAGE = aichatI18n.inappropriateUserMessage();
const TOO_PERSONAL_MESSAGE = aichatI18n.tooPersonalUserMessage();

const isAssistant = (role: string) => role === Role.ASSISTANT;
const isUser = (role: string) => role === Role.USER;
const isModelUpdate = (role: string) => role === Role.MODEL_UPDATE;
const isError = (role: string) => role === Role.ERROR_NOTIFICATION;

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
        {chatMessageText}
      </div>
    );
  }
};

const displayModelUpdateMessage = (
  message: ChatCompletionMessage,
  onRemove: () => void
) => {
  const {chatMessageText, chatMessageSuffix, timestamp} = message;

  return (
    <ChatNotificationMessage
      onRemove={onRemove}
      content={
        <>
          <span className={moduleStyles.modelUpdateMessageTextContainer}>
            <StrongText>{chatMessageText}</StrongText>
            {chatMessageSuffix?.text}
            {chatMessageSuffix?.boldtypeText && (
              <StrongText>{chatMessageSuffix?.boldtypeText}</StrongText>
            )}
          </span>
          <StrongText>{timestamp}</StrongText>
        </>
      }
      iconName="check"
      iconClass={moduleStyles.check}
      containerClass={moduleStyles.modelUpdateContainer}
    />
  );
};

const displayErrorMessage = (
  message: ChatCompletionMessage,
  onRemove: () => void
) => {
  const {chatMessageText} = message;

  return (
    <ChatNotificationMessage
      onRemove={onRemove}
      content={
        <>
          <span className={moduleStyles.modelUpdateMessageTextContainer}>
            <StrongText>{chatMessageText}</StrongText>
          </span>
        </>
      }
      iconName="circle-xmark"
      iconClass={moduleStyles.danger}
      containerClass={moduleStyles.dangerContainer}
    />
  );
};

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({message}) => {
  const dispatch = useAppDispatch();

  return (
    <div id={`ChatMessage id: ${message.id}`}>
      {isUser(message.role) &&
        displayUserMessage(message.status, message.chatMessageText)}

      {isAssistant(message.role) && (
        <div className={moduleStyles.assistantMessageContainer}>
          <img src={aiBotIcon} alt="An icon depicting a robot" />
          {displayAssistantMessage(message.status, message.chatMessageText)}
        </div>
      )}

      {isModelUpdate(message.role) &&
        displayModelUpdateMessage(message, () =>
          dispatch(removeUpdateMessage(message.id))
        )}

      {isError(message.role) &&
        displayErrorMessage(message, () =>
          dispatch(removeUpdateMessage(message.id))
        )}
    </div>
  );
};

export default ChatMessage;
