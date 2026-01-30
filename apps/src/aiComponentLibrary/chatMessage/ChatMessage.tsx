import classNames from 'classnames';
import React, {useEffect} from 'react';

import {sendAnalytics} from '@cdo/apps/aichat/redux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {getStore} from '@cdo/apps/redux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import AiTutorVersionActions from '../aiTutorVersionActions/AiTutorVersionActions';
import CopyableCodeBlock from '../copyableCodeBlock/CopyableCodeBlock';

import {Role} from './types';

import moduleStyles from './chat-message.module.scss';
interface ChatMessageProps {
  text: string;
  role: Role;
  customStyles?: {[label: string]: string};
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isTA?: boolean;
  messageStyle?: 'default' | 'warning' | 'danger';
  isAiTutorVersion?: boolean;
  isLastMessage?: boolean;
}

const codeCopiedAnalytics = (isTA: boolean) => () =>
  getStore().dispatch(sendAnalytics(EVENTS.CODE_COPIED, {isTA: isTA}));

const taRehypeMap = {
  pre: (props: React.ComponentPropsWithoutRef<'pre'>) => (
    <CopyableCodeBlock {...props} onCopy={codeCopiedAnalytics(true)} />
  ),
};

const nonTaRehypeMap = {
  pre: (props: React.ComponentPropsWithoutRef<'pre'>) => (
    <CopyableCodeBlock {...props} onCopy={codeCopiedAnalytics(false)} />
  ),
};

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  text,
  role,
  customStyles,
  header,
  footer,
  isTA,
  messageStyle = 'default',
  isAiTutorVersion = false,
  isLastMessage = false,
}) => {
  const rehypeMap = isTA ? taRehypeMap : nonTaRehypeMap;

  const aiTutorVersionFiles = useAppSelector(
    state => state.weblab2?.aiTutorVersionFiles || []
  );

  const showAiTutorVersionActions =
    isAiTutorVersion && isLastMessage && aiTutorVersionFiles.length > 0;

  // Show browser warning when user attempts to reload the page before accepting or rejecting AI Tutor's proposed updates.
  useEffect(() => {
    if (showAiTutorVersionActions) {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [showAiTutorVersionActions]);

  return (
    <div
      className={classNames(
        moduleStyles[`message-container-${role}`],
        customStyles && customStyles[`message-container-${role}`],
        'uitest-chat-message'
      )}
    >
      <div className={moduleStyles.messageWithChildren}>
        {header && <div>{header}</div>}
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
              messageStyle === 'danger' && moduleStyles.danger,
              messageStyle === 'warning' && moduleStyles.warning
            )}
            aria-label={
              role === Role.ASSISTANT
                ? commonI18n.aiChatMessageBot()
                : commonI18n.aiChatMessageUser()
            }
          >
            {role === Role.ASSISTANT ? (
              <div className={moduleStyles.assistantMessageContent}>
                <SafeMarkdown
                  markdown={text}
                  rehypeMap={rehypeMap}
                  openExternalLinksInNewTab
                />
                {showAiTutorVersionActions && (
                  <AiTutorVersionActions files={aiTutorVersionFiles} />
                )}
              </div>
            ) : (
              <p>{text}</p>
            )}
          </div>
        </div>
        {footer && (
          <div
            className={
              isTA ? moduleStyles.footerWithOverlay : moduleStyles.footer
            }
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
