import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {Role} from './types';

import moduleStyles from './chat-message.module.scss';

interface ChatMessageProps {
  text: string;
  assetUrls?: string[];
  role: Role;
  customStyles?: {[label: string]: string};
  footer?: React.ReactNode;
  isTA?: boolean;
  messageStyle?: 'default' | 'warning' | 'danger';
}

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  text,
  assetUrls,
  role,
  customStyles,
  footer,
  isTA,
  messageStyle = 'default',
}) => {
  return (
    <div
      className={classNames(
        moduleStyles[`message-container-${role}`],
        'uitest-chat-message'
      )}
    >
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
              messageStyle === 'danger' && moduleStyles.danger,
              messageStyle === 'warning' && moduleStyles.warning
            )}
            aria-label={
              role === Role.ASSISTANT
                ? commonI18n.aiChatMessageBot()
                : commonI18n.aiChatMessageUser()
            }
          >
            <SafeMarkdown markdown={text} />
            {assetUrls && (
              <div className={moduleStyles.imageRow}>
                {assetUrls.map(url => {
                  const parts = url.split('/');
                  const filename = parts[parts.length - 1];
                  return url.endsWith('.pdf') ? (
                    <div key={url} className={moduleStyles.pdfPreview}>
                      <FontAwesomeV6Icon
                        iconName="file-pdf"
                        className={moduleStyles.pdfIcon}
                      />
                      <span>{filename}</span>
                    </div>
                  ) : (
                    <img
                      key={url}
                      alt=""
                      src={url}
                      className={moduleStyles.image}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div
          className={
            isTA ? moduleStyles.footerWithOverlay : moduleStyles.footer
          }
        >
          {footer}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
