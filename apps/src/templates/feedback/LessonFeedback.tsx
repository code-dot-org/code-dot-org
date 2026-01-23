import {Button} from '@code-dot-org/component-library/button';
import {
  BodyFourText,
  Heading5,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import LessonRecommendedAction from './LessonRecommendedAction';

import styles from './LessonFeedback.module.scss';
interface LessonFeedbackProps {
  feedbackText: string;
  lessonName: string;
  lessonNumber: number;
  lessonLink: string;
  submittedAtDate: string | Date;
  teacherName: string;
}

function LessonFeedback({
  feedbackText,
  lessonName,
  lessonNumber,
  lessonLink,
  submittedAtDate,
  teacherName,
}: LessonFeedbackProps) {
  const formattedDate = new Date(submittedAtDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleGoToLesson = () => {
    window.open(lessonLink, '_blank');
  };

  return (
    <div className={styles.lessonFeedbackContainer}>
      <div className={styles.lessonFeedbackHeader}>
        <div className={styles.lessonFeedbackContent}>
          <Heading5 className={styles.lessonFeedbackHeading}>
            Lesson {lessonNumber}: {lessonName}
          </Heading5>

          <BodyFourText className={styles.lessonFeedbackDetails}>
            Sent by {teacherName} on {formattedDate}
          </BodyFourText>
        </div>

        <Button
          onClick={handleGoToLesson}
          text="Go to Lesson"
          type="secondary"
          size="s"
          iconRight={{iconName: 'arrow-up-right-from-square'}}
          color="gray"
        />
      </div>
      <hr />
      <div className={styles.lessonFeedbackBox}>{feedbackText}</div>
      <hr />
      {/* TODO: Add in real data here */}
      <LessonRecommendedAction
        resourceComment="Review the lesson and complete the exercises to improve your understanding."
        resourceLink={lessonLink}
      />
    </div>
  );
}

export default LessonFeedback;
