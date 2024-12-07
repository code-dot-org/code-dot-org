import React, {useMemo, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {modelDescriptions} from '../constants';
import {removeUpdateMessage} from '../redux/aichatRedux';
import {timestampToLocalTime} from '../redux/utils';
import {
  ChatEvent,
  ChatMessage as ChatMessageType,
  ChatEventDescriptions,
  ModelUpdate,
  isChatMessage,
  isNotification,
  isModelUpdate,
} from '../types';

import {AI_CUSTOMIZATIONS_LABELS} from './modelCustomization/constants';
import TeacherFeedbackFooter from './TeacherFeedbackFooter';

import styles from './chatWorkspace.module.scss';
import moduleStyles from '@cdo/apps/aiComponentLibrary/chatMessage/chat-message.module.scss';

interface ChatMessageViewProps {
  chatMessage: ChatMessageType;
  isChatHistoryView: boolean;
}

const ChatMessageView: React.FunctionComponent<ChatMessageViewProps> = ({
  chatMessage,
  isChatHistoryView,
}) => {
  const [showProfaneUserMessage, setShowProfaneUserMessage] = useState(false);

  const getDisplayText: string = useMemo(() => {
    switch (chatMessage.status) {
      case Status.OK:
      case Status.UNKNOWN:
        return chatMessage.chatMessageText;
      case Status.PROFANITY_VIOLATION:
        if (chatMessage.role === Role.ASSISTANT) {
          return commonI18n.aiChatInappropriateModelMessage();
        }

        return chatMessage.role === Role.USER && showProfaneUserMessage
          ? chatMessage.chatMessageText
          : commonI18n.aiChatInappropriateUserMessage();
      case Status.PII_VIOLATION:
        return commonI18n.aiChatTooPersonalUserMessage();
      case Status.USER_INPUT_TOO_LARGE:
        return chatMessage.role === Role.ASSISTANT
          ? commonI18n.aiChatUserInputTooLargeMessage()
          : chatMessage.chatMessageText;
      case Status.ERROR:
        return chatMessage.role === Role.ASSISTANT
          ? commonI18n.aiChatResponseError()
          : chatMessage.chatMessageText;
      default:
        return '';
    }
  }, [chatMessage, showProfaneUserMessage]);

  return (
    <ChatMessage
      chatMessageText={getDisplayText}
      role={chatMessage.role}
      status={chatMessage.status}
    >
      {isChatHistoryView &&
        getDisplayText === chatMessage.chatMessageText &&
        chatMessage.status !== Status.PROFANITY_VIOLATION && (
          <TeacherFeedbackFooter
            isProfanityViolation={false}
            chatMessage={chatMessage}
          />
        )}
      {isChatHistoryView &&
        chatMessage.role === Role.USER &&
        chatMessage.status === Status.PROFANITY_VIOLATION && (
          <>
            {showProfaneUserMessage && (
              <TeacherFeedbackFooter
                isProfanityViolation={true}
                chatMessage={chatMessage}
              />
            )}
            <div className={moduleStyles[`container-user`]}>
              <Button
                onClick={() => {
                  setShowProfaneUserMessage(!showProfaneUserMessage);
                }}
                text={showProfaneUserMessage ? 'Hide message' : 'Show message'}
                size="xs"
                type="tertiary"
                className={moduleStyles.userProfaneMessageButton}
              />
            </div>
          </>
        )}
    </ChatMessage>
  );
};

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
    ? `has been updated to ${updatedToText}.`
    : 'has been updated.';

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
    return (
      <ChatMessageView
        chatMessage={event}
        isChatHistoryView={isTeacherView || false}
      />
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
