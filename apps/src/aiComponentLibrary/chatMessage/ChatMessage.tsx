import classNames from 'classnames';
import React from 'react';

import {sendAnalytics} from '@cdo/apps/aichat/redux';
import {jsonVideoRehypeMap} from '@cdo/apps/jsonVideo/jsonVideoRehypeMap';
import {isViewingAiTutorVersionFileUpdates} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
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
  postText?: React.ReactNode;
  role: Role;
  customStyles?: {[label: string]: string};
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isTA?: boolean;
  messageStyle?: 'default' | 'warning' | 'danger';
  isLastMessage?: boolean;
}

const codeCopiedAnalytics = (isTA: boolean) => () =>
  getStore().dispatch(sendAnalytics(EVENTS.CODE_COPIED, {isTA: isTA}));

const taRehypeMap = {
  pre: (props: React.ComponentPropsWithoutRef<'pre'>) => (
    <CopyableCodeBlock {...props} onCopy={codeCopiedAnalytics(true)} />
  ),
  ...jsonVideoRehypeMap,
};

const nonTaRehypeMap = {
  pre: (props: React.ComponentPropsWithoutRef<'pre'>) => (
    <CopyableCodeBlock {...props} onCopy={codeCopiedAnalytics(false)} />
  ),
  ...jsonVideoRehypeMap,
};

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  text,
  postText,
  role,
  customStyles,
  header,
  footer,
  isTA,
  messageStyle = 'default',
  isLastMessage = false,
}) => {
  const rehypeMap = isTA ? taRehypeMap : nonTaRehypeMap;

  const viewingAiTutorVersionFileUpdates = useAppSelector(
    isViewingAiTutorVersionFileUpdates
  );

  const versionFiles = useAppSelector(
    state => state.lab2Project.aiTutorVersionFiles
  );

  const showAiTutorVersionActions =
    isLastMessage && viewingAiTutorVersionFileUpdates;

  const isAssistant = role === Role.ASSISTANT;

  return (
    <div
      className={classNames(
        moduleStyles[`message-container-${role}`],
        customStyles && customStyles[`message-container-${role}`],
        'uitest-chat-message'
      )}
    >
      <div className={moduleStyles.grid}>
        {isAssistant && isTA && (
          <div className={moduleStyles.botIconTAOverlayContainer}>
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
        <div className={moduleStyles[`message-and-header-${role}`]}>
          {header && <div className={moduleStyles.header}>{header}</div>}
          {(text || postText) && (
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
                  {showAiTutorVersionActions && versionFiles && (
                    <AiTutorVersionActions files={versionFiles} />
                  )}
                  {postText}
                </div>
              ) : (
                <p>{text}</p>
              )}
            </div>
          )}
        </div>
        {footer && (
          <div
            className={classNames(
              isAssistant &&
                (isTA
                  ? moduleStyles.assistantFooterBotIcon
                  : moduleStyles.assistantFooterNoBotIcon)
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
