import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import styles from './quiz-view.module.scss';

interface QuizIntroProps {
  quizTitle: string;
  introText?: string;
  questionCount: number;
  timeLimitMinutes?: number;
  onBegin: () => void;
}

// Shown before a quiz attempt starts, when there's introText or a time
// limit to show - see the needsIntroScreen check in Quiz.tsx. Reuses the
// same card chrome as the rest of the quiz view.
const QuizIntro: React.FunctionComponent<QuizIntroProps> = ({
  quizTitle,
  introText,
  questionCount,
  timeLimitMinutes,
  onBegin,
}) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <Typography variant="h2">{quizTitle}</Typography>
      {introText && <Typography variant="body2">{introText}</Typography>}
      <Typography variant="body2">
        {questionCount} question{questionCount === 1 ? '' : 's'}
        {timeLimitMinutes ? ` · ${timeLimitMinutes} minute time limit` : ''}
      </Typography>
    </div>
    <div className={styles.cardFooter}>
      <MuiButton
        variant="contained"
        color="primary"
        size="medium"
        type="button"
        onClick={onBegin}
      >
        Begin Quiz
      </MuiButton>
    </div>
  </div>
);

export default QuizIntro;
