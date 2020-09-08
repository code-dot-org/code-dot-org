import PropTypes from 'prop-types';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {makeEnum} from '@cdo/apps/utils';

export const sectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.string,
  // Though we validate valid login types here, the server actually owns the
  // canonical list, and passes us the list of valid login types.
  loginType: PropTypes.oneOf(Object.keys(SectionLoginType)),
  stageExtras: PropTypes.bool.isRequired,
  pairingAllowed: PropTypes.bool.isRequired,
  ttsAutoplayEnabled: PropTypes.bool.isRequired,
  studentCount: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  courseId: PropTypes.number,
  scriptId: PropTypes.number,
  grade: PropTypes.string,
  providerManaged: PropTypes.bool.isRequired
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
  version_year: PropTypes.string.isRequired,
  version_title: PropTypes.string.isRequired,
  is_stable: PropTypes.bool,
  supported_locales: PropTypes.arrayOf(PropTypes.string)
});

// An assignment family is a collection of versions of a course or script like
// "csd" or "coursea". For example, the assignment family "csd" could contain the
// courses csd-2017 and csd-2018.
//
// This is a bit confusing because we want to be able to just call csd a
// "course" instead of an "assignment family", but we can't because the term
// "course" is already used to refer to a specific version of a course such as
// csd-2018.
export const assignmentFamilyShape = PropTypes.shape({
  category_priority: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  position: PropTypes.number,
  assignment_family_title: PropTypes.string.isRequired,
  assignment_family_name: PropTypes.string.isRequired
});

// Represents a version of an assignment (script or course) as it
// appears in the version menu in the assignment selector.
export const assignmentVersionShape = PropTypes.shape({
  year: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isStable: PropTypes.bool.isRequired,
  isRecommended: PropTypes.bool,
  isSelected: PropTypes.bool,
  locales: PropTypes.arrayOf(PropTypes.string).isRequired,
  canViewVersion: PropTypes.bool
});

// Converts the shape of an array of assignment versions that comes from the server for a script
// to the shape outlined in assignmentVersionShape above.
export const convertAssignmentVersionShapeFromServer = serverVersions => {
  return serverVersions.map(v => {
    return {
      name: v.name,
      year: v.version_year,
      title: v.version_title,
      isStable: v.is_stable,
      locales: v.locales || [],
      canViewVersion: v.can_view_version
    };
  });
};

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

export const OAuthSectionTypes = makeEnum(
  'google_classroom',
  'clever',
  'microsoft_classroom'
);

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
