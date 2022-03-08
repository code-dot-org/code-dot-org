import PropTypes from 'prop-types';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

export const sectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.string,
  // Though we validate valid login types here, the server actually owns the
  // canonical list, and passes us the list of valid login types.
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
  grade: PropTypes.string,
  providerManaged: PropTypes.bool.isRequired,
  restrictSection: PropTypes.bool,
  postMilestoneDisabled: PropTypes.bool
});

// Used on the Teacher Dashboard for components that
// require more specific information.
export const summarizedSectionShape = PropTypes.shape({
  assignedTitle: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  course_id: PropTypes.number,
  currentUnitTitle: PropTypes.string,
  grade: PropTypes.string,
  hidden: PropTypes.bool,
  id: PropTypes.number.isRequired,
  linkToAssigned: PropTypes.string,
  linkToCurrentUnit: PropTypes.string,
  linkToProgress: PropTypes.string,
  linkToStudents: PropTypes.string,
  login_type: PropTypes.string,
  name: PropTypes.string,
  numberOfStudents: PropTypes.number,
  pairing_allowed: PropTypes.bool,
  tts_autoplay_enabled: PropTypes.bool,
  providerManaged: PropTypes.bool,
  script: PropTypes.object,
  sharing_disabled: PropTypes.bool,
  lesson_extras: PropTypes.bool,
  studentCount: PropTypes.number,
  students: PropTypes.array,
  teacherName: PropTypes.string
});

// An assignment is a course or script that a user can be assigned to.
export const assignmentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  courseId: PropTypes.number,
  scriptId: PropTypes.number,
  assignId: PropTypes.string.isRequried,
  category_priority: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  position: PropTypes.number,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  script_name: PropTypes.string.isRequired,
  assignment_family_name: PropTypes.string.isRequired,
  version_year: PropTypes.string,
  version_title: PropTypes.string,
  is_stable: PropTypes.bool,
  supported_locales: PropTypes.arrayOf(PropTypes.string),
  supported_locale_codes: PropTypes.arrayOf(PropTypes.string)
});

export const assignmentUnitShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  lesson_extras_available: PropTypes.bool.isRequired,
  text_to_speech_enabled: PropTypes.bool.isRequired
});

export const assignmentCourseVersionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  version_year: PropTypes.string.isRequired,
  content_root_id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  is_stable: PropTypes.bool.isRequired,
  is_recommended: PropTypes.bool.isRequired,
  locales: PropTypes.array,
  units: PropTypes.object.isRequired
});

export const assignmentCourseOfferingShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  display_name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  is_featured: PropTypes.bool.isRequired,
  course_versions: PropTypes.object.isRequired
});

export const classroomShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  section: PropTypes.string,
  enrollment_code: PropTypes.string.isRequired
});

export const loadErrorShape = PropTypes.shape({
  status: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired
});

export const sortableSectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  loginType: PropTypes.oneOf(Object.keys(SectionLoginType)).isRequired,
  studentCount: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  grade: PropTypes.string,
  providerManaged: PropTypes.bool.isRequired,
  hidden: PropTypes.bool.isRequired,
  assignmentName: PropTypes.arrayOf(PropTypes.string),
  assignmentPath: PropTypes.arrayOf(PropTypes.string)
});

export const sectionForDropdownShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isAssigned: PropTypes.bool.isRequired
});
