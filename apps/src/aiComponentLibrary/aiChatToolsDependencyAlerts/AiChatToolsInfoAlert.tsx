import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React from 'react';

import {AI_SETTINGS_SUPPORT_LINK} from '@cdo/apps/aichat/constants';

import styles from './ai-chat-tools-dependency-alerts.module.scss';

/**
 * Displays an aqua alert with the bot icon, a help link, and custom text.
 */
const AiChatToolsInfoAlert: React.FC<{text: string}> = ({text}) => {
  return (
    <Alert
      type={alertTypes.aqua}
      text={text}
      link={{
        href: AI_SETTINGS_SUPPORT_LINK,
        text: 'Learn more',
        openInNewTab: true,
      }}
      icon={{iconName: 'ai-bot-solid', iconFamily: 'kit'}}
      showIcon={true}
      className={styles.chatToolsInfo}
    />
  );
};

export default AiChatToolsInfoAlert;
