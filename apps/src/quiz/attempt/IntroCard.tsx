import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import QuizMetadataList from '../QuizMetadataList';

import AttemptCard from './AttemptCard';

import styles from './intro-card.module.scss';

export interface IntroCardProps {
  title: string;
  introText?: string;
  questionCount: number;
  // Omit for an untimed quiz.
  timeLimitMinutes?: number;
  allowMultipleAttempts: boolean;
  onBegin: () => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
}

// Shown before an attempt begins - what the quiz is and what to expect.
const IntroCard: React.FunctionComponent<IntroCardProps> = ({
  title,
  introText,
  questionCount,
  timeLimitMinutes,
  allowMultipleAttempts,
  onBegin,
  headingRef,
}) => {
  return (
    <AttemptCard
      label="Before you begin"
      title={title}
      headingRef={headingRef}
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
          <QuizMetadataList
            questionCount={questionCount}
            timeLimitMinutes={timeLimitMinutes}
            allowMultipleAttempts={allowMultipleAttempts}
          />
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

export default IntroCard;
