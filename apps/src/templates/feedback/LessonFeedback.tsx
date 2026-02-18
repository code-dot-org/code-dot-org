import {Button} from '@code-dot-org/component-library/button';
import {
  BodyFourText,
  Heading5,
} from '@code-dot-org/component-library/typography';
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
          <Heading5 className={styles.lessonFeedbackHeading}>
            {lessonTitle}
          </Heading5>

          <BodyFourText className={styles.lessonFeedbackDetails}>
            Sent by {teacherName || 'Your teacher'} on {formattedDate}
          </BodyFourText>
        </div>

        <Button
          onClick={handleGoToLesson}
          text="Go to Lesson"
          type="secondary"
          size="s"
          iconRight={{iconName: 'arrow-up-right-from-square'}}
          color="gray"
          disabled={!lessonStartUrl}
        />
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
