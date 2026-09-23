import {Typography} from '@mui/material';
import React from 'react';

import styles from './attempt-card.module.scss';

export interface AttemptCardProps {
  label?: string;
  title: string;
  // The type-specific answer area (choices, free response, etc).
  children: React.ReactNode;
}

// Shared card shell every question type renders through.
const AttemptCard: React.FunctionComponent<AttemptCardProps> = ({
  label,
  title,
  children,
}) => (
  <div className={styles.card}>
    <div className={styles.content}>
      <div className={styles.header}>
        {label && (
          <Typography variant="overline2" className={styles.label}>
            {label}
          </Typography>
        )}
        {/* Lets a page-change handler focus this heading programmatically. */}
        <Typography variant="h4" component="h2" tabIndex={-1}>
          {title}
        </Typography>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  </div>
);

export default AttemptCard;
