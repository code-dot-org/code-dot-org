import { PropTypes } from 'react';
import { SectionLoginType } from '@cdo/apps/util/sharedConstants';
import { makeEnum } from '@cdo/apps/utils';

export const sectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  // Though we validate valid login types here, the server actually owns the
  // canonical list, and passes us the list of valid login types.
  loginType: PropTypes.oneOf(Object.keys(SectionLoginType)),
  stageExtras: PropTypes.bool.isRequired,
  pairingAllowed: PropTypes.bool.isRequired,
  studentCount: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  courseId: PropTypes.number,
  scriptId: PropTypes.number,
  grade: PropTypes.string,
  providerManaged: PropTypes.bool.isRequired,
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
  // Display name
  name: PropTypes.string.isRequired,
  assignment_family_name: PropTypes.string.isRequired,
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

export const OAuthSectionTypes = makeEnum('google_classroom', 'clever', 'microsoft_classroom');

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
  assignmentPath: PropTypes.arrayOf(PropTypes.string),
});
