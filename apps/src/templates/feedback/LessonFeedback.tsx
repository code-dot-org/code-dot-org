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
}

function LessonFeedback({
  feedbackText,
  submittedAtDate,
  teacherName,
  lessonTitle,
  lessonStartUrl,
}: LessonFeedbackProps) {
  const formattedDate = new Date(submittedAtDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleGoToLesson = () => {
    if (lessonStartUrl) {
      window.open(lessonStartUrl, '_blank');
    }
  };

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
      <hr className={styles.lessonFeedbackDivider} />
      {/* TODO: Add in real data here */}
      <LessonRecommendedAction
        resourceComment="Review the lesson and complete the exercises to improve your understanding."
        resourceLink={lessonStartUrl || ''}
      />
    </div>
  );
}

export default LessonFeedback;
