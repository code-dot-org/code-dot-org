/* An icon, title, and message filling a panel that has nothing to show. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './emptyState.module.scss';

interface EmptyStateProps {
  iconName: string;
  title: string;
  message: string;
}

const EmptyState = ({iconName, title, message}: EmptyStateProps) => (
  <div className={styles.emptyState}>
    <span className={styles.icon} aria-hidden="true">
      <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
    </span>
    <div className={styles.text}>
      <Typography variant="body2" className={styles.title}>
        {title}
      </Typography>
      <Typography variant="body4" className={styles.message}>
        {message}
      </Typography>
    </div>
  </div>
);

export default EmptyState;
