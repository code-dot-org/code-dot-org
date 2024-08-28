import PropTypes from 'prop-types';

import {makeEnum} from '@cdo/apps/utils';

export const feedbackShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  seen_on_feedback_page_at: PropTypes.string,
  student_first_visited_at: PropTypes.string,
  created_at: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]).isRequired,
  comment: PropTypes.string,
  performance: PropTypes.string,
  is_awaiting_teacher_review: PropTypes.bool,
  review_state: PropTypes.string,
});

export const levelFeedbackShape = PropTypes.shape(levelFeedbackType);

export const levelFeedbackType = {
  lessonName: PropTypes.string.isRequired,
  lessonNum: PropTypes.number.isRequired,
  levelNum: PropTypes.number.isRequired,
  linkToLevel: PropTypes.string.isRequired,
  unitName: PropTypes.string,
  feedbacks: PropTypes.arrayOf(feedbackShape),
};

export const ReviewStates = makeEnum(
  'completed',
  'keepWorking',
  'awaitingReview'
);
