import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {Role} from './types';

import moduleStyles from './chat-message.module.scss';

interface ChatMessageProps {
  chatMessageText: string;
  role: Role;
  status: string;
  showProfaneUserMessageToggle?: boolean;
  customStyles?: {[label: string]: string};
  children?: React.ReactNode;
}

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  chatMessageText,
  role,
  status,
  showProfaneUserMessageToggle,
  customStyles,
  children,
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

  // All this to check the width of the chat message and set the width of the
  // div holding the children appropriately.
  const chatMessageRef = useRef<HTMLDivElement>(null);
  const [chatMessageWidth, setChatMessageWidth] = useState<number>(0);
  const resizeObserver = useMemo(() => {
    return new ResizeObserver(() => {
      if (chatMessageRef.current !== null) {
        setChatMessageWidth(chatMessageRef.current.offsetWidth);
      }
    });
  }, [chatMessageRef]);

  useEffect(() => {
    if (chatMessageRef.current !== null) {
      resizeObserver.observe(chatMessageRef.current);
    }
  }, [chatMessageRef, resizeObserver]);

  return (
    <>
      <div className={moduleStyles.messageWithChildren}>
        <div className={moduleStyles[`container-${role}`]}>
          {role === Role.ASSISTANT && (
            <div className={moduleStyles.botIconContainer}>
              <img
                src={aiBotOutlineIcon}
                alt={commonI18n.aiChatBotIconAlt()}
                className={moduleStyles.botIcon}
              />
            </div>
          )}
          <div
            className={classNames(
              moduleStyles[`message-${role}`],
              customStyles && customStyles[`message-${role}`],
              hasDangerStyle && moduleStyles.danger,
              hasWarningStyle && moduleStyles.warning
            )}
            ref={chatMessageRef}
            aria-label={
              role === Role.ASSISTANT ? 'AI bot' : 'User' + ' chat message'
            }
          >
            <SafeMarkdown markdown={getDisplayText} />
          </div>
        </div>
        <div style={{width: `${chatMessageWidth}px`, marginLeft: '48px'}}>
          {children}
        </div>
      </div>
      {showProfaneUserMessageToggle &&
        role === Role.USER &&
        status === Status.PROFANITY_VIOLATION && (
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
        )}
    </>
  );
};

export default ChatMessage;
