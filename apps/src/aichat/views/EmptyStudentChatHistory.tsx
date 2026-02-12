import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './empty-student-chat-history.module.scss';

const EmptyStudentChatHistory: React.FunctionComponent = () => {
  return (
    <div className={styles.emptyStudentChatHistoryContainer}>
      <div className={styles.iconContainer}>
        <FontAwesomeV6Icon iconName={'message-slash'} className={styles.icon} />
      </div>
      <div className={styles.textContainer}>
        <Typography variant="body2">
          <strong>No activity to show</strong>
        </Typography>
        <Typography variant="body4">
          There were no interactions with AI Tutor on this level.
        </Typography>
      </div>
    </div>
  );
};

export default EmptyStudentChatHistory;
