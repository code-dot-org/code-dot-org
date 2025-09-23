import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import aiBotLockedIcon from '@cdo/static/aichat/ai-bot-locked-icon.png';

import aichatI18n from '../locale';

import styles from './chatWorkspace.module.scss';

export const ChatDisabled: FC<{message?: string}> = ({
  message = aichatI18n.aiChatDisabled(),
}) => {
  return (
    <div className={styles.chatDisabledContainer}>
      <img src={aiBotLockedIcon} alt="" className={styles.chatDisabledIcon} />
      <BodyThreeText>{message}</BodyThreeText>
    </div>
  );
};
