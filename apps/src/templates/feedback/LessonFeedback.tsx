import {Button} from '@code-dot-org/component-library/button';
import {
  BodyFourText,
  Heading5,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import './LessonFeedback.scss';

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
    <div className="lesson-feedback-container">
      <div className="lesson-feedback-header">
        <div className="lesson-feedback-content">
          <Heading5 className="lesson-feedback-heading">
            Lesson {lessonNumber}: {lessonName}
          </Heading5>

          <BodyFourText className="lesson-feedback-details">
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
      <div className="lesson-feedback-box">{feedbackText}</div>
      <hr />
    </div>
  );
}

export default LessonFeedback;
