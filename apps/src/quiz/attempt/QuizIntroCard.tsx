import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import AttemptCard from './AttemptCard';

import styles from './quiz-intro-card.module.scss';

export interface QuizIntroCardProps {
  title: string;
  introText?: string;
  questionCount: number;
  // Omit for an untimed quiz.
  timeLimitMinutes?: number;
  allowMultipleAttempts: boolean;
  onBegin: () => void;
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const QuizIntroCard: React.FunctionComponent<QuizIntroCardProps> = ({
  title,
  introText,
  questionCount,
  timeLimitMinutes,
  allowMultipleAttempts,
  onBegin,
}) => {
  const metadata = [
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
      label="Before you begin"
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
            {metadata.map(({icon, text}) => (
              <li key={icon} className={styles.metadataItem}>
                <FontAwesomeV6Icon iconName={icon} />
                <Typography variant="body3" component="span">
                  {text}
                </Typography>
              </li>
            ))}
          </ul>
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
        </>
      }
    />
  );
};

export default QuizIntroCard;
