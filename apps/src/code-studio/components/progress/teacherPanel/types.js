import PropTypes from 'prop-types';

import {ReviewStates} from '@cdo/apps/templates/feedback/types';

export const sectionData = PropTypes.shape({
  is_verified_instructor: PropTypes.bool,
  lesson_extra: lessonExtra,
  level_examples: PropTypes.array,
  page_type: PropTypes.string,
  script_id: PropTypes.number,
  script_name: PropTypes.string,
  section: PropTypes.object,
});

const lessonExtra = PropTypes.shape({
  bonusLevels: PropTypes.array,
  lessonNumber: PropTypes.number,
  nextLessonNumber: PropTypes.number,
  nextLevelPath: PropTypes.string,
});

// This is the shape of the data returned by summarize_for_teacher_panel in
// script_level.rb.  Note that this data is also directly passed to code that
// expects an object with shape levelWithProgressType (defined in
// progress/progressTypes.js) so it must be compatible with that shape.
export const levelWithProgress = PropTypes.shape({
  id: PropTypes.string.isRequired,
  contained: PropTypes.bool,
  submitLevel: PropTypes.bool,
  paired: PropTypes.bool,
  partnerNames: PropTypes.arrayOf(PropTypes.string),
  partnerCount: PropTypes.number,
  isConceptLevel: PropTypes.bool,
  userId: PropTypes.number.isRequired,
  passed: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  levelNumber: PropTypes.number,
  assessment: PropTypes.bool,
  bonus: PropTypes.bool,
  teacherFeedbackReviewState: PropTypes.oneOf(Object.keys(ReviewStates)),
  kind: PropTypes.string,
  userLevelId: PropTypes.number,
  updatedAt: PropTypes.date,
});

export const studentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
});
