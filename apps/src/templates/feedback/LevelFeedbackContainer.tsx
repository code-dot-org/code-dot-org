import React from 'react';

import LevelFeedback from '@cdo/apps/templates/feedback/LevelFeedback';
import i18n from '@cdo/locale';

interface Feedback {
  id: number;
  seen_on_feedback_page_at?: string;
  student_first_visited_at?: string;
  created_at: string | Date;
  comment?: string;
  performance?: string;
  is_awaiting_teacher_review?: boolean;
  review_state?: string;
}

interface LevelFeedbackType {
  lessonName: string;
  lessonNum: number;
  levelNum: number;
  linkToLevel: string;
  unitName?: string;
  feedbacks?: Feedback[];
}

interface LevelFeedbackContainerProps {
  feedbacksByLevel: LevelFeedbackType[];
}

function LevelFeedbackContainer({
  feedbacksByLevel,
}: LevelFeedbackContainerProps) {
  const noFeedback = feedbacksByLevel.length === 0;

  return (
    <div>
      {noFeedback && <div>{i18n.feedbackNoneYet()}</div>}
      {feedbacksByLevel.map((levelFeedback, i) => {
        return <LevelFeedback key={i} {...levelFeedback} />;
      })}
    </div>
  );
}

export default LevelFeedbackContainer;
