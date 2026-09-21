import {Typography} from '@mui/material';
import React from 'react';

import styles from './question-container-base.module.scss';

export interface QuestionContainerBaseProps {
  // Omit for a quiz with only one question.
  questionLabel?: string;
  title: string;
  // Shown once the question has been answered if enabled.
  answerExplanation?: string;
  // The type-specific answer area (choices, free response, etc).
  children: React.ReactNode;
}

// Shared card shell every question type renders through.
const QuestionContainerBase: React.FunctionComponent<
  QuestionContainerBaseProps
> = ({questionLabel, title, answerExplanation, children}) => (
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

export default QuestionContainerBase;
