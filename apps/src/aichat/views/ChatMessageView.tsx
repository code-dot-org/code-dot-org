import React, {useMemo, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {getChatMessageDisplayText} from '@cdo/apps/aiComponentLibrary/chatMessage/utils';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../locale';
import {ChatMessage as ChatMessageType} from '../types';

import TeacherFeedbackFooter from './TeacherFeedbackFooter';

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

  const displayText: string = useMemo(() => {
    return getChatMessageDisplayText(
      chatMessage.status,
      chatMessage.role,
      chatMessage.chatMessageText,
      showProfaneUserMessage
    );
  }, [chatMessage, showProfaneUserMessage]);

  return (
    <ChatMessage
      {...chatMessage}
      showProfaneUserMessage={showProfaneUserMessage}
    >
      {isChatHistoryView &&
        displayText === chatMessage.chatMessageText &&
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
                text={
                  showProfaneUserMessage
                    ? aichatI18n.chatMessage_hideMessage()
                    : aichatI18n.chatMessage_showMessage()
                }
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

export default ChatMessageView;
