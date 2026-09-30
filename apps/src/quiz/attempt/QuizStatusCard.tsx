import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import AttemptCard from './AttemptCard';
import {formatSubmittedAt} from './types';

import styles from './quiz-status-card.module.scss';

export interface QuizStatusCardProps {
  title: string;
  introText?: string;
  questionCount: number;
  // Omit for an untimed quiz.
  timeLimitMinutes?: number;
  allowMultipleAttempts: boolean;
  onBegin?: () => void;
  // Set once an attempt is submitted with show correctness set to false.
  // Switches this from the pre-attempt intro to the "submitted" status
  // screen instead of a results card, since there's nothing to reveal.
  submittedAt?: string | null;
  canRetake?: boolean;
  onTryAgain?: () => void;
  onNextLevel?: () => void;
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const QuizStatusCard: React.FunctionComponent<QuizStatusCardProps> = ({
  title,
  introText,
  questionCount,
  timeLimitMinutes,
  allowMultipleAttempts,
  onBegin,
  submittedAt,
  canRetake,
  onTryAgain,
  onNextLevel,
}) => {
  const metadata = submittedAt
    ? [
        {
          icon: 'circle-check',
          text: `Submitted ${formatSubmittedAt(submittedAt)}`,
          className: styles.metadataItemSuccess,
        },
        {
          icon: 'bullseye-arrow',
          text: allowMultipleAttempts
            ? 'Unlimited attempts'
            : 'No attempts remaining',
        },
      ]
    : [
        {icon: 'circle-question', text: pluralize(questionCount, 'question')},
        ...(timeLimitMinutes
          ? [{icon: 'clock', text: pluralize(timeLimitMinutes, 'minute')}]
          : []),
        {
          icon: 'bullseye-arrow',
          text: allowMultipleAttempts ? 'Unlimited attempts' : '1 attempt',
        },
      ];

  return (
    <AttemptCard
      label={submittedAt ? 'submitted' : 'Before you begin'}
      title={title}
      description={
        introText && (
          <Typography
            variant="body2"
            component="div"
            className={styles.introText}
          >
            <SafeMarkdown markdown={introText} />
          </Typography>
        )
      }
      footer={
        <>
          <ul className={styles.metadata}>
            {metadata.map(({icon, text, className}) => (
              <li
                key={icon}
                className={
                  className
                    ? `${styles.metadataItem} ${className}`
                    : styles.metadataItem
                }
              >
                <FontAwesomeV6Icon iconName={icon} />
                <Typography variant="body3" component="span">
                  {text}
                </Typography>
              </li>
            ))}
          </ul>
          {submittedAt ? (
            <div className={styles.actions}>
              {canRetake && (
                <MuiButton
                  variant="outlined"
                  color="tertiary"
                  size="small"
                  type="button"
                  onClick={onTryAgain}
                >
                  Try again
                </MuiButton>
              )}
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                type="button"
                endIcon={<FontAwesomeV6Icon iconName="arrow-right" />}
                onClick={onNextLevel}
              >
                Next level
              </MuiButton>
            </div>
          ) : (
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              type="button"
              endIcon={<FontAwesomeV6Icon iconName="arrow-right" />}
              onClick={onBegin}
            >
              Begin
            </MuiButton>
          )}
        </>
      }
    />
  );
};

export default QuizStatusCard;
