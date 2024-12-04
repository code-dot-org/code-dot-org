import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import TeacherFeedbackFooter from '@cdo/apps/aichat/views/TeacherFeedbackFooter';
import Button from '@cdo/apps/componentLibrary/button/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {Role} from './types';

import moduleStyles from './chat-message.module.scss';

// TODO:
//    Make sure none of the UI shows up in student view
//    Implement calling redux thunk in the handleFlagClick and handleThumbClick functions
//    Replace hard coded strings with i18n ones

interface ChatMessageProps {
  chatMessageText: string;
  role: Role;
  status: string;
  isChatHistoryView?: boolean;
  customStyles?: {[label: string]: string};
  children?: React.ReactNode;
  isTA?: boolean;
}

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  chatMessageText,
  role,
  status,
  isChatHistoryView,
  customStyles,
  children,
  isTA,
}) => {
  const [showProfaneUserMessage, setShowProfaneUserMessage] = useState(false);

  const hasDangerStyle =
    status === Status.PROFANITY_VIOLATION ||
    status === Status.USER_INPUT_TOO_LARGE ||
    (role === Role.ASSISTANT && status === Status.ERROR);

  const hasWarningStyle = status === Status.PII_VIOLATION;

  const getDisplayText: string = useMemo(() => {
    switch (status) {
      case Status.OK:
      case Status.UNKNOWN:
        return chatMessageText;
      case Status.PROFANITY_VIOLATION:
        if (role === Role.ASSISTANT) {
          return commonI18n.aiChatInappropriateModelMessage();
        }

        return role === Role.USER && showProfaneUserMessage
          ? chatMessageText
          : commonI18n.aiChatInappropriateUserMessage();
      case Status.PII_VIOLATION:
        return commonI18n.aiChatTooPersonalUserMessage();
      case Status.USER_INPUT_TOO_LARGE:
        return role === Role.ASSISTANT
          ? commonI18n.aiChatUserInputTooLargeMessage()
          : chatMessageText;
      case Status.ERROR:
        return role === Role.ASSISTANT
          ? commonI18n.aiChatResponseError()
          : chatMessageText;
      default:
        return '';
    }
  }, [chatMessageText, role, status, showProfaneUserMessage]);

  return (
    <>
      <div className={moduleStyles[`message-container-${role}`]}>
        <div className={moduleStyles.messageWithChildren}>
          <div className={moduleStyles[`container-${role}`]}>
            {role === Role.ASSISTANT && (
              <div
                className={classNames(
                  isTA && moduleStyles.botIconContainerWithOverlay
                )}
              >
                <div className={classNames(moduleStyles.botIconContainer)}>
                  <img
                    src={aiBotOutlineIcon}
                    alt={commonI18n.aiChatBotIconAlt()}
                    className={moduleStyles.botIcon}
                  />
                </div>
                {isTA && (
                  <div className={moduleStyles.botOverlay}>
                    <span>{'TA'}</span>
                  </div>
                )}
              </div>
            )}
            <div
              className={classNames(
                moduleStyles[`message-${role}`],
                customStyles && customStyles[`message-${role}`],
                hasDangerStyle && moduleStyles.danger,
                hasWarningStyle && moduleStyles.warning
              )}
              aria-label={
                role === Role.ASSISTANT
                  ? commonI18n.aiChatMessageBot()
                  : commonI18n.aiChatMessageUser()
              }
            >
              <SafeMarkdown markdown={getDisplayText} />
            </div>
          </div>
          <div className={moduleStyles.childContainer}>
            {children}
            {/* This stuff really should be passed in as children, but there is some
                complexity with how it owns state for showProfaneUserMessage and it uses
                getDisplayText.  I think we could move all that into its own component?
                but getDisplayText is also used above on ln 115 so that would need to be
                pulled out into a helper... 
                
                For now, let's leave it so we can get the rest of the handlers implemented. */}
            {isChatHistoryView &&
              getDisplayText === chatMessageText &&
              status !== Status.PROFANITY_VIOLATION && (
                <TeacherFeedbackFooter isProfanityViolation={false} />
              )}
            {isChatHistoryView &&
              role === Role.USER &&
              status === Status.PROFANITY_VIOLATION && (
                <>
                  {showProfaneUserMessage && (
                    <TeacherFeedbackFooter isProfanityViolation={true} />
                  )}
                  <div className={moduleStyles[`container-user`]}>
                    <Button
                      onClick={() => {
                        setShowProfaneUserMessage(!showProfaneUserMessage);
                      }}
                      text={
                        showProfaneUserMessage ? 'Hide message' : 'Show message'
                      }
                      size="xs"
                      type="tertiary"
                      className={moduleStyles.userProfaneMessageButton}
                    />
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatMessage;
