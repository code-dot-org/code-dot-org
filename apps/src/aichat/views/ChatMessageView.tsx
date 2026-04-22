import classNames from 'classnames';
import React, {memo, useState} from 'react';

import {getLineReferenceText} from '@cdo/apps/aichat/utils';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import CopyButton from '@cdo/apps/aiComponentLibrary/copyButton/CopyButton';
import {commonI18n} from '@cdo/apps/types/locale';
import {ValueOf} from '@cdo/apps/types/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  AiChatClientTypes,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import {
  ChatAsset,
  type ChatMessage as ChatMessageType,
  isCompletedChatMessage,
  isServerChatEvent,
  ModelParameters,
} from '../types';
import {UserAddedSelectionContextItem} from '../types/userAddedSelectionContext';

import FilePreview from './assets/FilePreview';
import FlagResponseButton from './FlagResponseButton';
import CleanFeedbackFooter from './teacherFeedback/CleanFeedbackFooter';
import ProfanityFeedbackFooter from './teacherFeedback/ProfanityFeedbackFooter';

import styles from './chatWorkspace.module.scss';
interface ChatMessageViewProps {
  chatMessage: ChatMessageType;
  isTeacherView: boolean;
  buildAssetUrl?: (asset: ChatAsset) => string;
  clientType?: string;
  modelParameters?: ModelParameters;
  postText?: React.ReactNode;
  teacherFlaggedHidden: boolean;
}

const ChatMessageView: React.FunctionComponent<ChatMessageViewProps> = ({
  chatMessage,
  isTeacherView,
  buildAssetUrl,
  clientType,
  modelParameters,
  postText,
  teacherFlaggedHidden,
}) => {
  const user = useAppSelector(state => state.currentUser);

  const [showProfaneUserMessage, setShowProfaneUserMessage] = useState(false);
  const {
    status,
    role,
    chatMessageText,
    chatMessageDisplayText,
    assets,
    userAddedSelectionContext,
  } = chatMessage;
  // Determine if we should show the FlagResponseButton
  // The user must be a levelbuilder, and we currently only show the button for AI Tutor messages
  // that have been saved to the server (i.e. have an ID).
  const canLogToLangfuse =
    user.isLevelbuilder && clientType === AiChatClientTypes.AI_TUTOR;

  // `chatMessageDisplayText` is optional and only needed if intended display text
  //  is different from the chatMessageText sent to the model.
  const intendedDisplayText = chatMessageDisplayText ?? chatMessageText;

  const displayText = getChatMessageDisplayText(
    status,
    role,
    intendedDisplayText,
    showProfaneUserMessage,
    teacherFlaggedHidden
  );

  // If the chat message's display text is what is displayed (i.e. no error or violation)
  const messageVisible =
    displayText === intendedDisplayText &&
    chatMessage.status !== Status.PROFANITY_VIOLATION &&
    !teacherFlaggedHidden;

  // If a user's chat message has a profanity violation
  const userMessageProfanity =
    chatMessage.role === Role.USER &&
    chatMessage.status === Status.PROFANITY_VIOLATION &&
    !teacherFlaggedHidden;

  const isAssistant = chatMessage.role === Role.ASSISTANT;

  // In teacher view, all events should have been retrieved from the server (i.e. should have an ID).
  if (isTeacherView && !isServerChatEvent(chatMessage)) {
    console.warn('Invalid event in chat history', chatMessage);
    return null;
  }

  const footer = getFooter({
    isTeacherView,
    messageVisible,
    userMessageProfanity,
    isAssistant,
    chatMessage,
    canLogToLangfuse,
    modelParameters,
    showProfaneUserMessage,
    setShowProfaneUserMessage,
  });

  const header = getHeader({
    isAssistant,
    assets,
    buildAssetUrl,
    userAddedSelectionContext,
    teacherFlaggedHidden,
  });

  return (
    <ChatMessage
      text={displayText}
      postText={postText}
      role={role}
      messageStyle={getMessageStyle(status, role, teacherFlaggedHidden)}
      header={header}
      footer={footer}
    />
  );
};

export function getChatMessageDisplayText(
  status: ValueOf<typeof Status>,
  role: Role,
  chatMessageDisplayText: string,
  showProfaneUserMessage: boolean,
  teacherFlaggedHidden: boolean
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
    if (teacherFlaggedHidden) {
      return 'This message has been flagged as inappropriate by the teacher.';
    }
    return chatMessageDisplayText;
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
    case Status.MODEL_RATE_LIMITED:
      return commonI18n.aiChatModelRateLimited();
    case Status.ERROR:
      return commonI18n.aiChatResponseError();
  }
  if (teacherFlaggedHidden) {
    return 'This message has been flagged as inappropriate by the teacher.';
  }
  return chatMessageDisplayText;
}

interface GetHeaderParams {
  isAssistant: boolean;
  assets: ChatAsset[] | undefined;
  buildAssetUrl: ((asset: ChatAsset) => string) | undefined;
  userAddedSelectionContext: UserAddedSelectionContextItem[] | undefined;
  teacherFlaggedHidden: boolean;
}

function getHeader({
  isAssistant,
  assets,
  buildAssetUrl,
  userAddedSelectionContext,
  teacherFlaggedHidden,
}: GetHeaderParams): React.ReactNode {
  const hasAssets = assets && buildAssetUrl;
  const hasUserAddedSelectionContext = !!userAddedSelectionContext?.length;

  if ((!hasAssets && !hasUserAddedSelectionContext) || teacherFlaggedHidden) {
    return undefined;
  }

  return (
    <div
      className={classNames(styles.assetCol, isAssistant && styles.assistant)}
    >
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
                <img
                  alt=""
                  className={classNames(
                    styles.imagePreview,
                    isAssistant && styles.assistant
                  )}
                  src={url}
                />
              )}
            </button>
          );
        })}
      {hasUserAddedSelectionContext &&
        userAddedSelectionContext.map(contextItem => (
          <FilePreview
            key={contextItem.displayName}
            type="text"
            filename={contextItem.filename}
            fileDetail={
              contextItem.lineReference
                ? getLineReferenceText(contextItem.lineReference)
                : undefined
            }
          />
        ))}
    </div>
  );
}

interface GetFooterParams {
  isTeacherView: boolean;
  messageVisible: boolean;
  userMessageProfanity: boolean;
  isAssistant: boolean;
  chatMessage: ChatMessageType;
  canLogToLangfuse: boolean;
  modelParameters: ModelParameters | undefined;
  showProfaneUserMessage: boolean;
  setShowProfaneUserMessage: (value: boolean) => void;
}

function getFooter({
  isTeacherView,
  messageVisible,
  userMessageProfanity,
  isAssistant,
  chatMessage,
  canLogToLangfuse,
  modelParameters,
  showProfaneUserMessage,
  setShowProfaneUserMessage,
}: GetFooterParams): React.ReactNode {
  if (isTeacherView) {
    // Guaranteed by the component-level guard, but needed for type narrowing.
    if (!isServerChatEvent(chatMessage)) return null;

    const commonProps = {
      id: chatMessage.id,
      chatMessageText: chatMessage.chatMessageText,
      teacherFeedback: isCompletedChatMessage(chatMessage)
        ? chatMessage.teacherFeedback
        : undefined,
    };

    if (messageVisible) {
      return <CleanFeedbackFooter {...commonProps} isAssistant={isAssistant} />;
    }
    if (userMessageProfanity) {
      return (
        <ProfanityFeedbackFooter
          {...commonProps}
          toggleProfaneMessageVisibility={() =>
            setShowProfaneUserMessage(!showProfaneUserMessage)
          }
          profaneMessageVisible={showProfaneUserMessage}
        />
      );
    }
    return null;
  }

  if (messageVisible && isAssistant) {
    return (
      <div className={styles.buttonRow}>
        <CopyButton
          copyText={chatMessage.chatMessageText}
          usage={'ai-chat-msg-footer'}
        />
        {canLogToLangfuse && isServerChatEvent(chatMessage) && (
          <FlagResponseButton
            chatMessageId={chatMessage.id}
            chatMessageText={chatMessage.chatMessageText}
            modelParameters={modelParameters}
          />
        )}
      </div>
    );
  }
  return null;
}

function getMessageStyle(
  status: ValueOf<typeof Status>,
  role: Role,
  teacherFlaggedHidden: boolean
) {
  if (
    status === Status.PROFANITY_VIOLATION ||
    status === Status.USER_INPUT_TOO_LARGE ||
    teacherFlaggedHidden ||
    (role === Role.ASSISTANT &&
      (status === Status.ERROR ||
        status === Status.MODEL_TIMEOUT ||
        status === Status.MODEL_RATE_LIMITED))
  ) {
    return 'danger';
  }

  if (status === Status.PII_VIOLATION) {
    return 'warning';
  }

  return 'default';
}

export default memo(ChatMessageView);
