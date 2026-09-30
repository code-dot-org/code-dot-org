import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import AttemptCard from './AttemptCard';
import {formatSubmittedAt} from './types';

import styles from './results-card.module.scss';

export interface ResultsCardProps {
  title: string;
  showCorrectness: boolean;
  score: number | null;
  maxScore: number | null;
  attemptNumber: number;
  allowMultipleAttempts: boolean;
  canRetake: boolean;
  submittedAt: string;
  onTryAgain: () => void;
  onNextLevel: () => void;
}

// Shown once an attempt is submitted.
// Try again is a secondary action, only when the student has another attempt.
const ResultsCard: React.FunctionComponent<ResultsCardProps> = ({
  title,
  showCorrectness,
  score,
  maxScore,
  attemptNumber,
  allowMultipleAttempts,
  canRetake,
  submittedAt,
  onTryAgain,
  onNextLevel,
}) => {
  const percentage = maxScore
    ? Math.round(((score ?? 0) / maxScore) * 100)
    : null;

  return (
    <AttemptCard
      label={showCorrectness ? 'results' : 'submitted'}
      title={title}
      beforeFooterBorderedRow={
        <div className={styles.statsRow}>
          {showCorrectness && (
            <div className={styles.stat}>
              <Typography
                variant="h2"
                component="p"
                className={styles.statValue}
              >
                {percentage === null ? '—' : `${percentage}%`}
              </Typography>
              <div className={styles.statCaption}>
                <Typography variant="body2" className={styles.statTitle}>
                  {score ?? 0} of {maxScore ?? 0} Correct
                </Typography>
                <Typography variant="body4" className={styles.statSubtitle}>
                  Auto-graded questions only
                </Typography>
              </div>
            </div>
          )}
          <div className={styles.stat}>
            <Typography variant="h2" component="p" className={styles.statValue}>
              {attemptNumber}
            </Typography>
            <div className={styles.statCaption}>
              <Typography variant="body2" className={styles.statTitle}>
                Attempt #{attemptNumber}
              </Typography>
              <Typography variant="body4" className={styles.statSubtitle}>
                {allowMultipleAttempts
                  ? 'Unlimited attempts'
                  : '0 attempts remaining'}
              </Typography>
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <div className={styles.submittedStamp}>
            <FontAwesomeV6Icon iconName="circle-check" />
            <Typography variant="body3" component="span">
              Submitted {formatSubmittedAt(submittedAt)}
            </Typography>
          </div>
          <div className={styles.actions}>
            {canRetake && (
              <MuiButton
                variant="outlined"
                color="tertiary"
                size="medium"
                type="button"
                onClick={onTryAgain}
              >
                Try again
              </MuiButton>
            )}
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              type="button"
              endIcon={<FontAwesomeV6Icon iconName="arrow-right" />}
              onClick={onNextLevel}
            >
              Next level
            </MuiButton>
          </div>
        </>
      }
    />
  );
};

export default ResultsCard;
