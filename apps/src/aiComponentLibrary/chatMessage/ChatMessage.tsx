import classNames from 'classnames';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

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
}

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  text,
  role,
  customStyles,
  header,
  footer,
  isTA,
  messageStyle = 'default',
}) => {
  /*
   * Rehype component maps used to map between `pre` tags and `CopyableCodeBlock` components.
   *
   * For performance reasons, it is the `SafeMarkdown` consumer's responsibility to create the
   * rehypeMap outside  of the component function or to define the mapping in an ES module and
   * import it, if used in multiple components. See `SafeMarkdown` for more info.
   *
   * In this case, we create two maps outside the component function to pass different prop values
   * for `isTA` and then dynamically decide which map to use from within the component function.
   **/
  const taRehypeMap = {
    pre: (props: React.ComponentPropsWithoutRef<'pre'>) => (
      <CopyableCodeBlock {...props} isTA={true} />
    ),
  };

  const nonTaRehypeMap = {
    pre: (props: React.ComponentPropsWithoutRef<'pre'>) => (
      <CopyableCodeBlock {...props} isTA={false} />
    ),
  };
  const rehypeMap = isTA ? taRehypeMap : nonTaRehypeMap;
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
              <SafeMarkdown
                markdown={text}
                rehypeMap={rehypeMap}
                openExternalLinksInNewTab
              />
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
