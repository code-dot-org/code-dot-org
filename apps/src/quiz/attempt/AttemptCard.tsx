import {Typography} from '@mui/material';
import React from 'react';

import styles from './attempt-card.module.scss';

export interface AttemptCardProps {
  // Omit for a quiz with only one question.
  questionLabel?: string;
  title: string;
  // The type-specific answer area (choices, free response, etc).
  children: React.ReactNode;
}

// Shared card shell every question type renders through.
const AttemptCard: React.FunctionComponent<AttemptCardProps> = ({
  questionLabel,
  title,
  children,
}) => (
  <div className={styles.card}>
    <div className={styles.content}>
      <div className={styles.header}>
        {questionLabel && (
          <Typography variant="overline2" className={styles.questionLabel}>
            {questionLabel}
          </Typography>
        )}
        <Typography variant="h4" component="h2">
          {title}
        </Typography>
      </div>
      <div className={styles.questionBody}>{children}</div>
    </div>
  </div>
);

export default AttemptCard;
