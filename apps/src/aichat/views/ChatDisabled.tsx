import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {FC} from 'react';

import aichatI18n from '../locale';

import styles from './chatWorkspace.module.scss';

export const ChatDisabled: FC<{message?: string}> = ({
  message = aichatI18n.aiChatDisabled(),
}) => {
  return (
    <div className={styles.chatDisabledContainer}>
      <FontAwesomeV6Icon
        className={styles.chatDisabledIcon}
        iconName="ai-locked"
        iconFamily="kit"
      />
      <Typography variant="body3" gutterBottom>
        {message}
      </Typography>
    </div>
  );
};
