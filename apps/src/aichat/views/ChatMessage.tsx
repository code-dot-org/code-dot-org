import React from 'react';
import classNames from 'classnames';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography';
import aiBotIcon from '@cdo/static/aichat/ai-bot-icon.svg';
import {AichatInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {removeModelUpdateMessage} from '../redux/aichatRedux';
import {ChatCompletionMessage, Role} from '../types';
import aichatI18n from '../locale';
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

const displayUserMessage = (status: string, chatMessageText: string) => {
  if (status === Status.OK || status === Status.UNKNOWN) {
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
  } else if (status === Status.ERROR) {
    return (
      <div
        className={classNames(
          moduleStyles.message,
          // TODO: Add dedicated error message styling.
          moduleStyles.tooPersonalMessage
        )}
      >
        {'There was an error getting a response. Please try again.'}
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
        {chatMessageText}
      </div>
    );
  }
};

const displayModelUpdateMessage = (
  message: ChatCompletionMessage,
  onRemove: () => void
) => {
  const {chatMessageText, timestamp} = message;

  return (
    <ChatNotificationMessage
      onRemove={onRemove}
      content={
        <>
          <span className={moduleStyles.modelUpdateMessageTextContainer}>
            <StrongText>{chatMessageText}</StrongText> has been updated
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
          dispatch(removeModelUpdateMessage(message.id))
        )}
    </div>
  );
};

export default ChatMessage;
