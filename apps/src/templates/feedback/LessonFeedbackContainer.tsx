import React from 'react';

import LessonFeedback from '@cdo/apps/templates/feedback/LessonFeedback';
import i18n from '@cdo/locale';

// TO DO: Add resources
interface Feedback {
  id: number;
  lesson_id: number;
  submitted_feedback: string;
  submitted_at: string | Date;
}

interface LessonFeedbackType {
  lessonName: string;
  lessonNum: number;
  linkToLesson: string;
  feedbacks: Feedback[];
}

interface LessonFeedbackContainerProps {
  feedbacksByLesson: LessonFeedbackType[];
}

function LessonFeedbackContainer({
  feedbacksByLesson,
}: LessonFeedbackContainerProps) {
  const noFeedback = feedbacksByLesson.length === 0;

  return (
    <div>
      {noFeedback && <div>{i18n.feedbackNoneYet()}</div>}
      {feedbacksByLesson.map((lessonFeedback, i) => {
        return (
          <LessonFeedback
            key={i}
            feedbackText={lessonFeedback.feedbacks[0].submitted_feedback}
            lessonName={lessonFeedback.lessonName}
            lessonNumber={lessonFeedback.lessonNum}
            lessonLink={lessonFeedback.linkToLesson}
            submittedAtDate={lessonFeedback.feedbacks[0].submitted_at}
            teacherName={'Mr. Jacobs'} // TO DO: Add teacher name when available
          />
        );
      })}
    </div>
  );
}

export default LessonFeedbackContainer;
