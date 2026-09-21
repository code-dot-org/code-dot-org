import {Typography} from '@mui/material';
import React from 'react';

import styles from './attempt-card.module.scss';

export interface AttemptCardProps {
  // Omit for a quiz with only one question.
  questionLabel?: string;
  title: string;
  // Shown once the question has been answered if enabled.
  answerExplanation?: string;
  // The type-specific answer area (choices, free response, etc).
  children: React.ReactNode;
}

// Shared card shell used throughout the attempt flow - intro screen,
// individual questions, and results all render through this.
const AttemptCard: React.FunctionComponent<AttemptCardProps> = ({
  questionLabel,
  title,
  answerExplanation,
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
        <Typography variant="h4">{title}</Typography>
      </div>
      <div className={styles.questionBody}>{children}</div>
      {answerExplanation && (
        <div className={styles.explanation}>
          <div className={styles.explanationHeader}>
            <Typography variant="overline2" className={styles.explanationLabel}>
              Answer explanation
            </Typography>
          </div>
          <Typography variant="body3" className={styles.explanationBody}>
            {answerExplanation}
          </Typography>
        </div>
      )}
    </div>
  </div>
);

export default AttemptCard;
