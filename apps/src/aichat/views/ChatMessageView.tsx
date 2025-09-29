import React, {memo, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import CopyButton from '@cdo/apps/aiComponentLibrary/copyButton/CopyButton';
import {commonI18n} from '@cdo/apps/types/locale';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {
  ChatAsset,
  type ChatMessage as ChatMessageType,
  isCompletedChatMessage,
  isServerChatEvent,
} from '../types';

import FilePreview from './assets/FilePreview';
import CleanFeedbackFooter from './teacherFeedback/CleanFeedbackFooter';
import ProfanityFeedbackFooter from './teacherFeedback/ProfanityFeedbackFooter';

import styles from './chatWorkspace.module.scss';

interface ChatMessageViewProps {
  chatMessage: ChatMessageType;
  isChatHistoryView: boolean;
  buildAssetUrl?: (asset: ChatAsset) => string;
}

const ChatMessageView: React.FunctionComponent<ChatMessageViewProps> = ({
  chatMessage,
  isChatHistoryView,
  buildAssetUrl,
}) => {
  const [showProfaneUserMessage, setShowProfaneUserMessage] = useState(false);
  const {status, role, chatMessageText, assets, userAddedSelectionContext} =
    chatMessage;
  const hasAssets = assets && buildAssetUrl;
  const hasUserAddedSelectionContext = !!userAddedSelectionContext?.length;

  const displayText = getChatMessageDisplayText(
    status,
    role,
    chatMessageText,
    showProfaneUserMessage
  );

  // If the chat message's text is what is displayed (i.e. no error or violation)
  const messageVisible =
    displayText === chatMessage.chatMessageText &&
    chatMessage.status !== Status.PROFANITY_VIOLATION;

  // If a user's chat message has a profanity violation
  const userMessageProfanity =
    chatMessage.role === Role.USER &&
    chatMessage.status === Status.PROFANITY_VIOLATION;

  const isAssistant = chatMessage.role === Role.ASSISTANT;

  let footer;
  if (isChatHistoryView) {
    // In chat history view, all events should have been retrieved from the server (i.e. should have an ID).
    if (!isServerChatEvent(chatMessage)) {
      console.warn('Invalid event in chat history', chatMessage);
      return null;
    }

    const commonProps = {
      id: chatMessage.id,
      chatMessageText: chatMessage.chatMessageText,
      teacherFeedback: isCompletedChatMessage(chatMessage)
        ? chatMessage.teacherFeedback
        : undefined,
    };

    footer = messageVisible ? (
      <CleanFeedbackFooter {...commonProps} isAssistant={isAssistant} />
    ) : userMessageProfanity ? (
      <ProfanityFeedbackFooter
        {...commonProps}
        toggleProfaneMessageVisibility={() =>
          setShowProfaneUserMessage(!showProfaneUserMessage)
        }
        profaneMessageVisible={showProfaneUserMessage}
      />
    ) : null;
  } else {
    footer =
      messageVisible && isAssistant ? (
        <CopyButton copyText={chatMessage.chatMessageText} />
      ) : null;
  }

  let header;
  if (!isAssistant && (hasAssets || hasUserAddedSelectionContext)) {
    header = (
      <div className={styles.assetCol}>
        {hasAssets &&
          assets.map(asset => {
            const filename = asset.filename;
            const url = buildAssetUrl(asset);
            return (
              <button
                key={filename}
                type="button"
                className={styles.assetButton}
                onClick={() => window.open(url, '_blank')}
              >
                {filename.endsWith('.pdf') ? (
                  <FilePreview type="pdf" filename={filename} url={url} />
                ) : (
                  <img alt="" className={styles.imagePreview} src={url} />
                )}
              </button>
            );
          })}
        {hasUserAddedSelectionContext &&
          userAddedSelectionContext.map(contextItem => (
            <FilePreview
              key={contextItem.displayName}
              type="text"
              filename={contextItem.displayName}
            />
          ))}
      </div>
    );
  }

  return (
    <ChatMessage
      text={displayText}
      role={role}
      messageStyle={getMessageStyle(status, role)}
      header={header}
      footer={footer}
    />
  );
};

function getChatMessageDisplayText(
  status: ValueOf<typeof Status>,
  role: Role,
  chatMessageText: string,
  showProfaneUserMessage: boolean
) {
  // If Role is USER, display the original message, unless there is a PII violation
  // or a profanity violation and the message is not supposed to be shown.
  if (role === Role.USER) {
    if (status === Status.PII_VIOLATION) {
      return commonI18n.aiChatTooPersonalUserMessage();
    }
    if (status === Status.PROFANITY_VIOLATION && !showProfaneUserMessage) {
      return commonI18n.aiChatInappropriateUserMessage();
    }
    return chatMessageText;
  }

  // If Role is ASSISTANT, display the appropriate message based on the status.
  switch (status) {
    case Status.PROFANITY_VIOLATION:
      return commonI18n.aiChatInappropriateModelMessage();
    case Status.PII_VIOLATION:
      return commonI18n.aiChatTooPersonalUserMessage();
    case Status.USER_INPUT_TOO_LARGE:
      return commonI18n.aiChatUserInputTooLargeMessage();
    case Status.MODEL_TIMEOUT:
      return commonI18n.aiChatTimeout();
    case Status.ERROR:
      return commonI18n.aiChatResponseError();
    default:
      return chatMessageText;
  }
}

function getMessageStyle(status: ValueOf<typeof Status>, role: Role) {
  if (
    status === Status.PROFANITY_VIOLATION ||
    status === Status.USER_INPUT_TOO_LARGE ||
    (role === Role.ASSISTANT &&
      (status === Status.ERROR || status === Status.MODEL_TIMEOUT))
  ) {
    return 'danger';
  }

  if (status === Status.PII_VIOLATION) {
    return 'warning';
  }

  return 'default';
}

export default memo(ChatMessageView);
