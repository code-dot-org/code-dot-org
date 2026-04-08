import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';

import LessonRecommendedAction from './LessonRecommendedAction';

import styles from './LessonFeedback.module.scss';

interface LessonFeedbackProps {
  feedbackText: string | undefined;
  lessonId: number;
  teacherName: string | null;
  submittedAtDate: string | Date;
  lessonTitle?: string;
  lessonStartUrl?: string;
  resource?: {
    recommended_action?: string;
    resource_name?: string;
    resource_link?: string;
  };
}

function LessonFeedback({
  feedbackText,
  submittedAtDate,
  teacherName,
  lessonTitle,
  lessonStartUrl,
  resource,
}: LessonFeedbackProps) {
  const formattedDate = new Date(submittedAtDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleGoToLesson = () => {
    if (lessonStartUrl) {
      window.open(lessonStartUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const showRecommendedAction =
    resource &&
    (!!resource.recommended_action ||
      (resource.resource_name && resource.resource_link));

  return (
    <div className={styles.lessonFeedbackContainer}>
      <div className={styles.lessonFeedbackHeader}>
        <div className={styles.lessonFeedbackContent}>
          <Typography className={styles.lessonFeedbackHeading} variant="h5">
            {lessonTitle}
          </Typography>

          <Typography className={styles.lessonFeedbackDetails} variant="body4">
            Sent by {teacherName || 'Your teacher'} on {formattedDate}
          </Typography>
        </div>

        <MuiButton
          variant="outlined"
          color="tertiary"
          size="small"
          disabled={!lessonStartUrl}
          onClick={handleGoToLesson}
          type="button"
          endIcon={<FontAwesomeV6Icon iconName="arrow-up-right-from-square" />}
        >
          {'Go to Lesson'}
        </MuiButton>
      </div>
      <hr className={styles.lessonFeedbackDivider} />
      <div className={styles.lessonFeedbackBox}>{feedbackText}</div>
      {showRecommendedAction && (
        <>
          <hr className={styles.lessonFeedbackDivider} />
          <LessonRecommendedAction resource={resource} />
        </>
      )}
    </div>
  );
}

export default LessonFeedback;
