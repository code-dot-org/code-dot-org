import PropTypes from 'prop-types';

// Types of rows in studentData/editingData
// newStudent looks like a studentRow with isEditing true, but
// is updated like an add row, since the student has yet to be added.
export const RowType = {
  ADD: 'addRow',
  NEW_STUDENT: 'newStudentRow',
  STUDENT: 'studentRow'
};

export const studentSectionDataPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  username: PropTypes.string,
  email: PropTypes.string,
  age: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  gender: PropTypes.string,
  secretWords: PropTypes.string,
  secretPicturePath: PropTypes.string,
  sectionId: PropTypes.number,
  loginType: PropTypes.string,
  hasEverSignedIn: PropTypes.bool,
  dependsOnThisSectionForLogin: PropTypes.bool,
  rowType: PropTypes.oneOf(Object.values(RowType)),
  userType: PropTypes.string
});

export const ParentLetterButtonMetricsCategory = {
  ABOVE_TABLE: 'above-table',
  BELOW_TABLE: 'below-table'
};

export const PrintLoginCardsButtonMetricsCategory = {
  MANAGE_STUDENTS: 'manage-students',
  LOGIN_INFO: 'section-login-info'
};

// Response from server after adding a new student to the section.
export const AddStatus = {
  SUCCESS: 'success',
  FAIL: 'fail',
  FULL: 'full'
};

// Constants around moving students to another section.
// Response from server after moving student(s) to a new section
export const TransferStatus = {
  SUCCESS: 'success',
  FAIL: 'fail',
  FULL: 'full',
  PENDING: 'pending'
};

// Type of student transfer - whether students are being moved (and subsequently removed from current section) or copied to new section
export const TransferType = {
  MOVE_STUDENTS: 'moveStudents',
  COPY_STUDENTS: 'copyStudents'
};

/** Initial state for manageStudents.transferData redux store.
 * studentIds - student ids selected to be moved to another section
 * sectionId - section id to which new students will be moved
 * otherTeacher - students are being moved to a section owned by a different teacher
 * otherTeacherSection - if new section is owned by a different teacher, current teacher inputs new section code
 * copyStudents - whether or not students will be copied to new section or moved (and subsequently removed from current section)
 */
export const blankStudentTransfer = {
  studentIds: [],
  sectionId: null,
  otherTeacher: false,
  otherTeacherSection: '',
  copyStudents: true
};

/** Initial state for manageStudents.transferStatus redux store.
 * status (TransferStatus) - whether transfer was successful or failed
 * type (TransferType) - whether transfer moved students (and subsequently removed them from current section) or copied them
 * error - error text returned from server
 * numStudents - number of students transferred to new section
 * sectionDisplay - how section should be displayed to user. most likely the section name or section code
 */
export const blankStudentTransferStatus = {
  status: null,
  type: null,
  error: null,
  numStudents: 0,
  sectionDisplay: ''
};
