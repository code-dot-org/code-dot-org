import Alert from '@code-dot-org/component-library/alert';
import classNames from 'classnames';
import React, {forwardRef, memo} from 'react';

import AiTutorVersionActionNotification from '@cdo/apps/aiComponentLibrary/aiTutorVersionActionNotification/AiTutorVersionActionNotification';
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

import ChatMessageView, {getChatMessageDisplayText} from './ChatMessageView';
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

interface ChatEventViewProps extends React.HTMLAttributes<HTMLDivElement> {
  event: ChatEvent;
  isTeacherView?: boolean;
  buildAssetUrl?: (asset: ChatAsset) => string;
  isAiTutorVersion?: boolean;
}

function formatModelUpdateText(update: ModelUpdate): string {
  const {updatedField, updatedValue, timestamp} = update;
  const fieldLabel = AI_CUSTOMIZATIONS_LABELS[updatedField]!;

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
const ChatEventView = forwardRef<HTMLDivElement, ChatEventViewProps>(
  (
    {
      event,
      isTeacherView,
      buildAssetUrl,
      tabIndex,
      onKeyDown,
      isAiTutorVersion,
    },
    ref
  ) => {
    const dispatch = useAppDispatch();

    const chatEventDescriptions = isTeacherView
      ? chatEventDescriptionsStudent
      : chatEventDescriptionsOwner;

    // Only wrap chat messages in a focusable div for keyboard navigation
    if (isChatMessage(event)) {
      return (
        <div
          ref={ref}
          tabIndex={tabIndex}
          onKeyDown={onKeyDown}
          aria-label={getChatMessageDisplayText(
            event.status,
            event.role,
            event.chatMessageText,
            false // Profane messages are never shown in the aria-label context to prevent screen readers from reading inappropriate content.
          )}
          className={styles.chatMessageOutline}
        >
          <ChatMessageView
            chatMessage={event}
            isChatHistoryView={isTeacherView || false}
            buildAssetUrl={buildAssetUrl}
            isAiTutorVersion={isAiTutorVersion}
          />
        </div>
      );
    }

    if (isNotification(event)) {
      const {removeId, text, notificationType, files, timestamp} = event;

      // Use special notification component for AI tutor version actions
      if (
        notificationType === 'aiTutorVersionActionAccept' ||
        notificationType === 'aiTutorVersionActionReject'
      ) {
        return (
          <AiTutorVersionActionNotification
            text={text}
            type={
              notificationType === 'aiTutorVersionActionAccept'
                ? 'accept'
                : 'reject'
            }
            ref={ref}
            tabIndex={tabIndex}
            onKeyDown={onKeyDown}
            aria-label={`Notification: ${text}`}
            className={styles.chatMessageOutline}
            files={files}
          />
        );
      }

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
          ref={ref}
          tabIndex={tabIndex}
          onKeyDown={onKeyDown}
          aria-label={`Notification: ${text}, Time: ${timestampToLocalTime(
            timestamp
          )}`}
          className={styles.chatMessageOutline}
        />
      );
    }

    if (isModelUpdate(event)) {
      return (
        <Alert
          className={classNames(
            'uitest-aichat-chat-alert',
            styles.chatMessageOutline
          )}
          text={formatModelUpdateText(event)}
          type="success"
          size="s"
          onClose={
            isTeacherView
              ? undefined
              : () => dispatch(removeUpdateMessage(event.removeId))
          }
          ref={ref}
          tabIndex={tabIndex}
          onKeyDown={onKeyDown}
          aria-label={formatModelUpdateText(event)}
        />
      );
    }

    // Automatically narrowed to UserActionEvent
    return (
      <Alert
        text={chatEventDescriptions[event.descriptionKey]}
        type="info"
        size="s"
        ref={ref}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        aria-label={chatEventDescriptions[event.descriptionKey]}
        className={styles.chatMessageOutline}
      />
    );
  }
);

export default memo(ChatEventView);
