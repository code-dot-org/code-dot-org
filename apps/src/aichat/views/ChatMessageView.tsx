import React, {memo, useMemo, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {getChatMessageDisplayText} from '@cdo/apps/aiComponentLibrary/chatMessage/utils';
import CopyButton from '@cdo/apps/aiComponentLibrary/copyButton/CopyButton';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {ChatMessage as ChatMessageType} from '../types';

import CleanFeedbackFooter from './teacherFeedback/CleanFeedbackFooter';
import ProfanityFeedbackFooter from './teacherFeedback/ProfanityFeedbackFooter';

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

  // If the chat message's text is what is displayed (i.e. no error or violation)
  const messageVisible =
    displayText === chatMessage.chatMessageText &&
    chatMessage.status !== Status.PROFANITY_VIOLATION;

  // If a user's chat message has a profanity violation
  const userMessageProfanity =
    chatMessage.role === Role.USER &&
    chatMessage.status === Status.PROFANITY_VIOLATION;

  // Note: ID should always be defined when viewing chat history,
  // but is currently marked optional because the ChatEvent type
  // is used for both chat history and live chat.
  // TODO: Clean up types to separate server and client IDs.
  const commonProps = {
    id: chatMessage.id!,
    chatMessageText: chatMessage.chatMessageText,
    teacherFeedback: chatMessage?.teacherFeedback,
  };

  const isAssistant = chatMessage.role === Role.ASSISTANT;

  const chatHistoryFooter = messageVisible ? (
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
  const defaultFooter =
    messageVisible && isAssistant ? (
      <CopyButton copyText={chatMessage.chatMessageText} />
    ) : null;

  return (
    <ChatMessage
      {...chatMessage}
      showProfaneUserMessage={showProfaneUserMessage}
      footer={isChatHistoryView ? chatHistoryFooter : defaultFooter}
    />
  );
};

export default memo(ChatMessageView);
