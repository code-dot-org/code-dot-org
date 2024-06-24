import PropTypes from 'prop-types';

import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

export const sectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.string,
  loginType: PropTypes.oneOf(Object.keys(SectionLoginType)),
  lessonExtras: PropTypes.bool.isRequired,
  pairingAllowed: PropTypes.bool.isRequired,
  ttsAutoplayEnabled: PropTypes.bool.isRequired,
  studentCount: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  courseOfferingId: PropTypes.number,
  courseVersionId: PropTypes.number,
  unitId: PropTypes.number,
  courseId: PropTypes.number,
  scriptId: PropTypes.number,
  grades: PropTypes.arrayOf(PropTypes.string),
  providerManaged: PropTypes.bool.isRequired,
  restrictSection: PropTypes.bool,
  postMilestoneDisabled: PropTypes.bool,
  syncEnabled: PropTypes.bool,
});

export const assignmentUnitShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  lesson_extras_available: PropTypes.bool.isRequired,
  text_to_speech_enabled: PropTypes.bool.isRequired,
  position: PropTypes.number,
});

export const assignmentCourseVersionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  key: PropTypes.string.isRequired,
  version_year: PropTypes.string.isRequired,
  content_root_id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  is_stable: PropTypes.bool.isRequired,
  is_recommended: PropTypes.bool.isRequired,
  locales: PropTypes.array,
  units: PropTypes.object.isRequired,
});

export const assignmentCourseOfferingShape = PropTypes.shape({
  elementary: PropTypes.object,
  high: PropTypes.object,
  hoc: PropTypes.object,
  middle: PropTypes.object,
});

export const classroomShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  section: PropTypes.string,
  enrollment_code: PropTypes.string.isRequired,
});

export const loadErrorShape = PropTypes.shape({
  status: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
});

export const sortableSectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  courseVersionName: PropTypes.string,
  loginType: PropTypes.oneOf(Object.keys(SectionLoginType)).isRequired,
  studentCount: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  grades: PropTypes.arrayOf(PropTypes.string),
  providerManaged: PropTypes.bool.isRequired,
  hidden: PropTypes.bool.isRequired,
  assignmentName: PropTypes.arrayOf(PropTypes.string),
  assignmentPath: PropTypes.arrayOf(PropTypes.string),
});

export const sectionForDropdownShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isAssigned: PropTypes.bool.isRequired,
});
