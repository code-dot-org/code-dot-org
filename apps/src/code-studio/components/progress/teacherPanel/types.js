import PropTypes from 'prop-types';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';

export const sectionData = PropTypes.shape({
  is_verified_teacher: PropTypes.bool,
  lesson_extra: lessonExtra,
  level_examples: PropTypes.array,
  page_type: PropTypes.string,
  script_id: PropTypes.number,
  script_name: PropTypes.string,
  section: PropTypes.object,
  teacher_level: levelWithProgress
});

const lessonExtra = PropTypes.shape({
  bonusLevels: PropTypes.array,
  lessonNumber: PropTypes.number,
  nextLessonNumber: PropTypes.number,
  nextLevelPath: PropTypes.string
});

export const levelWithProgress = PropTypes.shape({
  id: PropTypes.string.isRequired,
  contained: PropTypes.bool,
  submitLevel: PropTypes.bool,
  paired: PropTypes.bool,
  driver: PropTypes.string,
  navigator: PropTypes.string,
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
  updatedAt: PropTypes.date
});

export const studentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired
});
