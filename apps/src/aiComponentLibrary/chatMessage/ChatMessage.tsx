import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Markdown, type MarkdownExtension} from '@code-dot-org/markdown';
import classNames from 'classnames';
import React from 'react';

import {sendAnalytics} from '@cdo/apps/aichat/redux';
import JsonVideoLink from '@cdo/apps/jsonVideo/JsonVideoLink';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {getStore} from '@cdo/apps/redux';
import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

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
}

const codeCopiedAnalytics = (isTA: boolean) => () =>
  getStore().dispatch(sendAnalytics(EVENTS.CODE_COPIED, {isTA: isTA}));

type MarkdownComponentProps<Tag extends 'a' | 'pre'> =
  React.ComponentPropsWithoutRef<Tag> & {node?: unknown};

const chatMarkdownExtensions = (isTA: boolean): MarkdownExtension[] => [
  {
    name: 'chatMessage',
    components: {
      pre: ({node: _node, ...props}: MarkdownComponentProps<'pre'>) => (
        <CopyableCodeBlock {...props} onCopy={codeCopiedAnalytics(isTA)} />
      ),
      a: ({node: _node, ...props}: MarkdownComponentProps<'a'>) => (
        <JsonVideoLink {...props} target="_blank" rel="noopener noreferrer" />
      ),
    },
  },
];

const taMarkdownExtensions = chatMarkdownExtensions(true);
const nonTaMarkdownExtensions = chatMarkdownExtensions(false);

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  text,
  postText,
  role,
  customStyles,
  header,
  footer,
  isTA,
  messageStyle = 'default',
}) => {
  const markdownExtensions = isTA
    ? taMarkdownExtensions
    : nonTaMarkdownExtensions;

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
        {isAssistant &&
          isTA &&
          (experiments.isEnabled('ta-teacher-panel') ? (
            // The mark reads "TA" itself, so it needs no overlay pill.
            <FontAwesomeV6Icon
              iconFamily="kit"
              iconName="ta"
              title={commonI18n.aiChatBotIconAlt()}
              className={moduleStyles.taDiscIcon}
            />
          ) : (
            <div className={moduleStyles.botIconTAOverlayContainer}>
              <div className={classNames(moduleStyles.botIconContainer)}>
                <img
                  src={aiBotOutlineIcon}
                  alt={commonI18n.aiChatBotIconAlt()}
                  className={moduleStyles.botIcon}
                />
              </div>
              <div className={moduleStyles.botOverlay}>
                <span>{'TA'}</span>
              </div>
            </div>
          ))}
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
                  <div data-notranslate>
                    <Markdown
                      content={text}
                      extensions={markdownExtensions}
                      bodyVariant="body3"
                    />
                  </div>
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
