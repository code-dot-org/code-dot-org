import _ from 'lodash';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {sectionCode} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

// Response from server after adding a new student to the section.
export const AddStatus = {
  SUCCESS: "success",
  FAIL: "fail",
};

// Types of rows in studentData/editingData
// newStudent looks like a studentRow with isEditing true, but
// is updated like an add row, since the student has yet to be added.
export const RowType = {
  ADD: "addRow",
  NEW_STUDENT: "newStudentRow",
  STUDENT: "studentRow",
};

// Constants around moving students to another section.
// OTHER_TEACHER - value determines whether students will be moved to a section owned by a different teacher
// COPY_STUDENTS - value determines whether students will be copied to the new section or moved (and subsequently removed from current section)
export const OTHER_TEACHER = "otherTeacher";
export const COPY_STUDENTS = "copy";

/** Initial state for manageStudents.transferData redux store.
  * studentIds - student ids selected to be moved to another section
  * sectionId - section id to which new students will be moved
  * otherTeacher - students are being moved to a section owned by a different teacher
  * otherTeacherSection - if new section is owned by a different teacher, current teacher inputs new section code
  * copyStudents - whether or not students will be copied to new section or moved (and subsequently removed from current section)
**/
export const blankStudentTransfer = {
  studentIds: [],
  sectionId: null,
  otherTeacher: false,
  otherTeacherSection: '',
  copyStudents: true
};

// This doesn't get used to make a server call, but does
// need to be unique from the rest of the ids.
const addRowId = 0;

// Number that is available as a new id for adding students.
// Each needs a unique id, and counts backward from -1.
let addRowIdCounter = -1;

// Add row is for adding a single student from blank data.
const blankAddRow = {
  id: addRowId,
  name: '',
  age: '',
  gender: '',
  username: '',
  loginType: '',
  sharingDisabled: true,
  isEditing: true,
  rowType: RowType.ADD,
};

// New student row is created after a list of students have been
// added to the table, but their information hasn't been saved
// to the server yet.
const blankNewStudentRow = {
  id: addRowId,
  name: '',
  age: '',
  gender: '',
  username: '',
  loginType: '',
  sharingDisabled: true,
  isEditing: true,
  rowType: RowType.NEW_STUDENT,
};

/** Initial state for the manageStudents redux store.
 * loginType - a SectionLoginType for the active section.
 * sectionId - the sectionId number for the active section.
 * studentData - represents student information persisted on the server.
 * if isEditing (in studentData), then editingData represents the data
 * in the edit fields on the client which has not yet been persisted to the server.
 * showSharingColumn - whether the control project sharing column should be hidden or visible in the table.
 * addStatus - status is of type AddStatus and numStudents is how many students were added.
 * transferData - initial state described above in blankStudentTransfer assignment
 */
const initialState = {
  loginType: '',
  studentData: {},
  editingData: {},
  sectionId: null,
  showSharingColumn: false,
  addStatus: {status: null, numStudents: null},
  transferData: {...blankStudentTransfer}
};

const SET_LOGIN_TYPE = 'manageStudents/SET_LOGIN_TYPE';
const SET_STUDENTS = 'manageStudents/SET_STUDENTS';
const SET_SECTION_ID = 'manageStudents/SET_SECTION_ID';
const START_EDITING_STUDENT = 'manageStudents/START_EDITING_STUDENT';
const CANCEL_EDITING_STUDENT = 'manageStudents/CANCEL_EDITING_STUDENT';
const REMOVE_STUDENT = 'manageStudents/REMOVE_STUDENT';
const SET_SECRET_IMAGE = 'manageStudents/SET_SECRET_IMAGE';
const SET_SECRET_WORDS = 'manageStudents/SET_SECRET_WORDS';
const EDIT_STUDENT = 'manageStudents/EDIT_STUDENT';
const START_SAVING_STUDENT = 'manageStudents/START_SAVING_STUDENT';
const SAVE_STUDENT_SUCCESS = 'manageStudents/SAVE_STUDENT_SUCCESS';
const ADD_STUDENT_SUCCESS = 'manageStudents/ADD_STUDENT_SUCCESS';
const ADD_STUDENT_FAILURE = 'manageStudents/ADD_STUDENT_FAILURE';
const ADD_MULTIPLE_ROWS = 'manageStudents/ADD_MULTIPLE_ROWS';
const TOGGLE_SHARING_COLUMN = 'manageStudents/TOGGLE_SHARING_COLUMN';
const EDIT_ALL = 'manageStudents/EDIT_ALL';
const UPDATE_ALL_SHARE_SETTING = 'manageStudents/UPDATE_ALL_SHARE_SETTING';
const SET_SHARING_DEFAULT = 'manageStudents/SET_SHARING_DEFAULT';
const UPDATE_STUDENT_TRANSFER = 'manageStudents/UPDATE_STUDENT_TRANSFER';

export const setLoginType = loginType => ({ type: SET_LOGIN_TYPE, loginType });
export const setSectionId = sectionId => ({ type: SET_SECTION_ID, sectionId});
export const setStudents = studentData => ({ type: SET_STUDENTS, studentData });
export const startEditingStudent = (studentId) => ({ type: START_EDITING_STUDENT, studentId });
export const cancelEditingStudent = (studentId) => ({ type: CANCEL_EDITING_STUDENT, studentId });
export const removeStudent = (studentId) => ({ type: REMOVE_STUDENT, studentId });
export const setSecretImage = (studentId, image) => ({ type: SET_SECRET_IMAGE, studentId, image });
export const setSecretWords = (studentId, words) => ({ type: SET_SECRET_WORDS, studentId, words });
export const editStudent = (studentId, studentData) => ({ type: EDIT_STUDENT, studentId, studentData });
export const setSharingDefault = (studentId) => ({ type: SET_SHARING_DEFAULT, studentId});
export const editAll = () => ({ type: EDIT_ALL });
export const updateAllShareSetting = (disable) => ({type: UPDATE_ALL_SHARE_SETTING, disable});
export const startSavingStudent = (studentId) => ({ type: START_SAVING_STUDENT, studentId });
export const saveStudentSuccess = (studentId) => ({ type: SAVE_STUDENT_SUCCESS, studentId });
export const updateStudentTransfer = transferData => ({ type: UPDATE_STUDENT_TRANSFER, transferData });
export const addStudentsSuccess = (numStudents, rowIds, studentData) => (
  { type: ADD_STUDENT_SUCCESS, numStudents, rowIds, studentData }
);
export const addStudentsFailure = (numStudents, error, studentIds) => (
  { type: ADD_STUDENT_FAILURE, numStudents, error, studentIds }
);
export const addMultipleRows = (studentData) => ({ type: ADD_MULTIPLE_ROWS, studentData });
export const toggleSharingColumn = () => ({type: TOGGLE_SHARING_COLUMN});

export const handleShareSetting = (disable) => {
 return (dispatch, getState) => {
   dispatch(editAll());
   dispatch(updateAllShareSetting(disable));
 };
};

export const saveStudent = (studentId) => {
  return (dispatch, getState) => {
    const state = getState().manageStudents;
    dispatch(startSavingStudent(studentId));
    updateStudentOnServer(state.editingData[studentId], state.sectionId, (error, data) => {
      if (error) {
        console.error(error);
      }
      dispatch(saveStudentSuccess(studentId));
    });
  };
};

// Saves all RowType.STUDENT currently being edited and adds all
// RowType.NEW_STUDENT currently being edited.
export const saveAllStudents = () => {
  return (dispatch, getState) => {
    const state = getState().manageStudents;

    // Currently, every update is an individual call to the server.
    const currentlyEditedData = Object.values(state.editingData);
    let studentsToSave = currentlyEditedData.filter(student => student.rowType === RowType.STUDENT);
    studentsToSave.forEach((student) => {
      if (student.name !== '') {
        dispatch(saveStudent(student.id));
      }
    });

    // Adding students can be saved together.
    // Only add students that currently are not in progress saving.
    const arrayOfEditedData = Object.values(state.editingData);
    const newStudentsToAdd = arrayOfEditedData
      .filter(student => (student.rowType === RowType.NEW_STUDENT && !student.isSaving))
      .map(student => student.id);
    if (newStudentsToAdd.length > 0) {
      dispatch(addStudents(newStudentsToAdd));
    }
  };
};

// Adds a student, with the given row id (studentIds), from RowType.ADD or
// RowType.NEW_STUDENT.
export const addStudents = (studentIds) => {
  return (dispatch, getState) => {
    const state = getState().manageStudents;
    const numStudentsToAdd = studentIds.length;

    // Update each row to saving in progress.
    for (let i = 0; i<studentIds.length; i++) {
      dispatch(startSavingStudent(studentIds[i]));
    }

    const arrayOfEditedData = Object.values(state.editingData);
    const filteredData = arrayOfEditedData.filter(student => studentIds.includes(student.id));
    addStudentOnServer(filteredData,
      state.sectionId, (error, data) => {
      if (error) {
        dispatch(addStudentsFailure(numStudentsToAdd, error, studentIds));
        console.error(error);
      } else {
        dispatch(addStudentsSuccess(numStudentsToAdd, studentIds,
          convertStudentServerData(data, state.loginType, state.sectionId)));
      }
    });
  };
};

// Creates a new RowType.NEW_STUDENT for each name in the array.
export const addMultipleAddRows = (studentNames) => {
  return (dispatch, getState) => {
    let studentData = {};
    for (let i = 0; i<studentNames.length; i++) {
      // Do not add rows with no name
      if (studentNames[i] === '') { continue; }

      // Create a new uniqueId for the newStudentRow
      const newId = addRowIdCounter;
      addRowIdCounter = addRowIdCounter - 1;

      // Create student data for each student name.
      studentData[newId] = {
        ...blankNewStudentRow,
        name: studentNames[i],
        id: newId,
      };
    }
    dispatch(addMultipleRows(studentData));
  };
};

export const transferStudents = () => {
  return (dispatch, getState) => {
    const state = getState();
    const currentSectionCode = sectionCode(state, state.manageStudents.sectionId);
    const {studentIds, sectionId: newSectionId, otherTeacher, otherTeacherSection, copyStudents} = state.manageStudents.transferData;
    let newSectionCode;

    if (otherTeacher && otherTeacherSection) {
      newSectionCode = otherTeacherSection;
    } else {
      newSectionCode = sectionCode(state, newSectionId);
    }

    transferStudentsOnServer(studentIds, currentSectionCode, newSectionCode, copyStudents, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        if (!copyStudents) {
          studentIds.forEach(id => {
            dispatch(removeStudent(id));
          });
        }
        updateStudentTransfer({...blankStudentTransfer});
      }
    });
  };
};

export default function manageStudents(state=initialState, action) {
  if (action.type === SET_LOGIN_TYPE) {
    let addRowInitialization = {};
    if (action.loginType === SectionLoginType.word || action.loginType === SectionLoginType.picture) {
      addRowInitialization = {
        studentData: {
          [addRowId]: {
            ...blankAddRow,
            loginType: action.loginType,
          }
        },
        editingData: {
          [addRowId]: {
            ...blankAddRow,
            loginType: action.loginType,

          }
        }
      };
    }
    return {
      ...state,
      loginType: action.loginType,
      ...addRowInitialization,
    };
  }
  if (action.type === SET_SECTION_ID) {
    return {
      ...state,
      sectionId: action.sectionId,
    };
  }
  if (action.type === SET_STUDENTS) {
    let studentData = {
      ...action.studentData
    };
    if (state.loginType === SectionLoginType.word || state.loginType === SectionLoginType.picture) {
      studentData[addRowId] = {
        ...blankAddRow,
        loginType: state.loginType,
      };
    }
    return {
      ...state,
      studentData: studentData,
      addStatus: {status: null, numStudents: null},
    };
  }
  if (action.type === START_EDITING_STUDENT) {
    return {
      ...state,
      studentData: {
        ...state.studentData,
        [action.studentId]: {
          ...state.studentData[action.studentId],
          isEditing: true
        }
      },
      editingData: {
        ...state.editingData,
        [action.studentId]: {
          ...state.studentData[action.studentId],
          id: action.studentId,
        }
      }
    };
  }
  if (action.type === CANCEL_EDITING_STUDENT) {
    return {
      ...state,
      studentData: {
        ...state.studentData,
        [action.studentId]: {
          ...state.studentData[action.studentId],
          isEditing: false
        }
      },
      editingData: _.omit(state.editingData, action.studentId),
    };
  }
  if (action.type === START_SAVING_STUDENT) {
    return {
      ...state,
      studentData: {
        ...state.studentData,
        [action.studentId]: {
          ...state.studentData[action.studentId],
          isSaving: true
        }
      },
      editingData: {
        ...state.editingData,
        [action.studentId]: {
          ...state.editingData[action.studentId],
          isSaving: true
        }
      },
    };
  }
  if (action.type === SAVE_STUDENT_SUCCESS) {
    return {
      ...state,
      studentData: {
        ...state.studentData,
        [action.studentId]: {
          ...state.studentData[action.studentId],
          ...state.editingData[action.studentId],
          isEditing: false,
          isSaving: false,
          rowType: RowType.STUDENT,
        }
      },
      editingData: _.omit(state.editingData, action.studentId),
    };
  }
  if (action.type === ADD_STUDENT_FAILURE) {
    let newState = {
      ...state,
      addStatus: {status: AddStatus.FAIL, numStudents: action.numStudents}
    };
    for (let i = 0; i<action.studentIds.length; i++) {
      newState.studentData[action.studentIds[i]] = {
        ...state.studentData[action.studentIds[i]],
        isSaving: false,
      };
      newState.editingData[action.studentIds[i]] = {
        ...state.editingData[action.studentIds[i]],
        isSaving: false,
      };
    }
    return newState;
  }
  if (action.type === ADD_STUDENT_SUCCESS) {
    let newState = {
      ...state,
      studentData: {
        ..._.omit(state.studentData, action.rowIds),
        ...action.studentData,
        [addRowId]: {
          ...blankAddRow,
          loginType: state.loginType,
        }
      },
      editingData: {
        ..._.omit(state.editingData, action.rowIds),
        [addRowId]: {
          ...blankAddRow,
          loginType: state.loginType,
        }
      },
      addStatus: {status: AddStatus.SUCCESS, numStudents: action.numStudents}
    };
    return newState;
  }
  if (action.type === SET_SHARING_DEFAULT) {
    const editedAge = state.editingData[action.studentId].age;
    // For privacy reasons, we disable sharing by default if the student is under the age of 13.
    const sharingDisabled = editedAge < 13;
    return {
      ...state,
      editingData: {
        ...state.editingData,
        [action.studentId]: {
          ...state.editingData[action.studentId],
          id: action.studentId,
          sharingDisabled: sharingDisabled
        }
      }
    };
  }
  if (action.type === EDIT_STUDENT) {
    return {
      ...state,
      editingData: {
        ...state.editingData,
        [action.studentId]: {
          ...state.editingData[action.studentId],
          ...action.studentData,
          id: action.studentId,
        }
      }
    };
  }
  if (action.type === EDIT_ALL) {
    let newState = {
      ...state
    };
    for (const studentKey in state.studentData) {
      const student = state.studentData[studentKey];
      newState.studentData[student.id].isEditing = true;
      newState.editingData[student.id] = {
        ...newState.studentData[student.id],
        ...state.editingData[student.id],
      };
    }
    return newState;
  }
  if (action.type === UPDATE_ALL_SHARE_SETTING) {
    let newState = {
      ...state
    };
    for (const studentKey in state.studentData) {
      const student = state.studentData[studentKey];
      newState.editingData[student.id].sharingDisabled = action.disable;
    }
    return newState;
  }
  if (action.type === SET_SECRET_IMAGE) {
    return {
      ...state,
      studentData: {
        ...state.studentData,
        [action.studentId]: {
          ...state.studentData[action.studentId],
          secretPicturePath: action.image,
        }
      }
    };
  }
  if (action.type === SET_SECRET_WORDS) {
    return {
      ...state,
      studentData: {
        ...state.studentData,
        [action.studentId]: {
          ...state.studentData[action.studentId],
          secretWords: action.words,
        }
      }
    };
  }
  if (action.type === REMOVE_STUDENT) {
    const studentId = action.studentId;
    const student = state.studentData[studentId];
    if (!student) {
      throw new Error('student does not exist');
    }
    return {
      ...state,
      studentData: _.omit(state.studentData, studentId),
      editingData: _.omit(state.editingData, studentId),
    };
  }
  if (action.type === ADD_MULTIPLE_ROWS) {
    return {
      ...state,
      studentData: {
        ...state.studentData,
        ...action.studentData
      },
      editingData: {
        ...state.editingData,
        ...action.studentData
      }
    };
  }
  if (action.type === TOGGLE_SHARING_COLUMN) {
    return {
      ...state,
      showSharingColumn: !state.showSharingColumn,
    };
  }
  if (action.type === UPDATE_STUDENT_TRANSFER) {
    return {
      ...state,
      transferData: {
        ...state.transferData,
        ...action.transferData
      }
    };
  }

  return state;
}

// Converts data from /dashboardapi/sections/sectionid/students to a set of key/value
// objects for the redux store
export const convertStudentServerData = (studentData, loginType, sectionId) => {
  let studentLookup = {};
  for (let i=0; i < studentData.length; i++) {
    let student = studentData[i];
    studentLookup[student.id] = {
      id: student.id,
      name: student.name,
      username: student.username,
      email: student.email,
      age: student.age || '',
      gender: student.gender || '',
      secretWords: student.secret_words,
      secretPicturePath: student.secret_picture_path,
      loginType: loginType,
      sectionId: sectionId,
      sharingDisabled: student.sharing_disabled,
      isEditing: false,
      isSaving: false,
      rowType: RowType.STUDENT,
    };
  }
  return studentLookup;
};

// Converts key/value id/student pairs to an array of student objects for the
// component to display
// TODO(caleybrock): memoize this - sections could be a few thousand students
export const convertStudentDataToArray = (studentData) => {
  return Object.values(studentData).reverse();
};

// Make a post request to edit a student.
const updateStudentOnServer = (updatedStudentInfo, sectionId, onComplete) => {
  const dataToUpdate = {
    student: {
      id: updatedStudentInfo.id,
      name: updatedStudentInfo.name,
      age: updatedStudentInfo.age,
      gender: updatedStudentInfo.gender,
      sharing_disabled: updatedStudentInfo.sharingDisabled,
    }
  };
  $.ajax({
    url: `/dashboardapi/sections/${sectionId}/students/${dataToUpdate.student.id}`,
    method: 'PATCH',
    type: 'json',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify(dataToUpdate),
  }).done((data) => {
    onComplete(null, data);
  }).fail((jqXhr, status) => {
    onComplete(status, null);
  });
};

// Make a post request to add students.
const addStudentOnServer = (updatedStudentsInfo, sectionId, onComplete) => {
  const studentsToAdd = [];
  for (let i = 0; i<updatedStudentsInfo.length; i++) {
    studentsToAdd[i] = {
      editing: true,
      name: updatedStudentsInfo[i].name,
      age: updatedStudentsInfo[i].age,
      gender: updatedStudentsInfo[i].gender,
      sharing_disabled: updatedStudentsInfo[i].sharingDisabled,
    };
  }
  const students = {
    students: studentsToAdd
  };
  $.ajax({
    url: `/dashboardapi/sections/${sectionId}/students/bulk_add`,
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify(students),
  }).done((data) => {
    onComplete(null, data);
  }).fail((jqXhr, status) => {
    onComplete(status, null);
  });
};

// Make a post request to transfer students.
const transferStudentsOnServer = (studentIds, currentSectionCode, newSectionCode, stayEnrolledInCurrentSection, onComplete) => {
  const payload = {
    student_ids: studentIds,
    current_section_code: currentSectionCode,
    new_section_code: newSectionCode,
    stay_enrolled_in_current_section: stayEnrolledInCurrentSection
  };
  $.ajax({
    url: '/dashboardapi/sections/transfers',
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify(payload)
  }).done(data => {
    onComplete(null, data);
  }).fail((jqXhr, status) => {
    onComplete(status, null);
  });
};
