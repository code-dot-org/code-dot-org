import React, {useMemo, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {getChatMessageDisplayText} from '@cdo/apps/aiComponentLibrary/chatMessage/utils';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../locale';
import {ChatMessage as ChatMessageType} from '../types';

import TeacherFeedbackFooter from './TeacherFeedbackFooter';

import moduleStyles from './chat-message-view.module.scss';

interface ChatMessageViewProps {
  chatMessage: ChatMessageType;
  isChatHistoryView: boolean;
}

const ChatMessageView: React.FunctionComponent<ChatMessageViewProps> = ({
  chatMessage,
  isChatHistoryView,
}) => {
  const [showProfaneUserMessage, setShowProfaneUserMessage] = useState(false);

  const displayText: string = useMemo(() => {
    return getChatMessageDisplayText(
      chatMessage.status,
      chatMessage.role,
      chatMessage.chatMessageText,
      showProfaneUserMessage
    );
  }, [chatMessage, showProfaneUserMessage]);

  const ShowHideMessageButton = () => (
    <Button
      onClick={() => {
        setShowProfaneUserMessage(!showProfaneUserMessage);
      }}
      text={
        showProfaneUserMessage
          ? aichatI18n.chatMessage_hideMessage()
          : aichatI18n.chatMessage_showMessage()
      }
      size="xs"
      type="tertiary"
      className={moduleStyles.userProfaneMessageButton}
    />
  );

  // TODO: Clean up this logic; ideally these should just be inverses of each other.

  const noProfanityViolation =
    displayText === chatMessage.chatMessageText &&
    chatMessage.status !== Status.PROFANITY_VIOLATION;
  const hasProfanityViolation =
    chatMessage.role === Role.USER &&
    chatMessage.status === Status.PROFANITY_VIOLATION;

  const NoProfanityFooter = () => (
    <TeacherFeedbackFooter
      isProfanityViolation={false}
      {...chatMessage}
      // Note: ID should always be defined when viewing chat history,
      // but is currently marked optional because the ChatEvent type
      // is used for both chat history and live chat.
      // TODO: Clean up types to separate server and client IDs.
      id={chatMessage.id!}
    />
  );

  const ProfanityFooter = () => (
    <>
      {showProfaneUserMessage && (
        <TeacherFeedbackFooter
          isProfanityViolation={true}
          {...chatMessage}
          id={chatMessage.id!}
        />
      )}
      <div className={moduleStyles.showHideMessageButtonContainer}>
        <ShowHideMessageButton />
      </div>
    </>
  );

  const footer = noProfanityViolation ? (
    <NoProfanityFooter />
  ) : hasProfanityViolation ? (
    <ProfanityFooter />
  ) : null;

  return (
    <ChatMessage
      {...chatMessage}
      showProfaneUserMessage={showProfaneUserMessage}
      footer={isChatHistoryView && footer}
    />
  );
};

export default ChatMessageView;
