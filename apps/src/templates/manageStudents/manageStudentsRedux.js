import _ from 'lodash';

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

export const setLoginType = loginType => ({ type: SET_LOGIN_TYPE, loginType });
export const setSectionId = sectionId => ({ type: SET_SECTION_ID, sectionId});
export const setStudents = studentData => ({ type: SET_STUDENTS, studentData });
export const startEditingStudent = (studentId) => ({ type: START_EDITING_STUDENT, studentId });
export const cancelEditingStudent = (studentId) => ({ type: CANCEL_EDITING_STUDENT, studentId });
export const removeStudent = (studentId) => ({ type: REMOVE_STUDENT, studentId });
export const setSecretImage = (studentId, image) => ({ type: SET_SECRET_IMAGE, studentId, image });
export const setSecretWords = (studentId, words) => ({ type: SET_SECRET_WORDS, studentId, words });
export const editStudent = (studentId, studentData) => ({ type: EDIT_STUDENT, studentId, studentData });

export const saveStudent = (studentId) => {
  return (dispatch, getState) => {
    const state = getState().manageStudents;
    dispatch({ type: START_SAVING_STUDENT, studentId });
    updateStudentOnServer(state.editingData[studentId], (error, data) => {
      if (error) {
        console.error(error);
      }
      dispatch({ type: SAVE_STUDENT_SUCCESS, studentId });
    });
  };
};

const initialState = {
  loginType: '',
  studentData: {},
  editingData: {},
  sectionId: null,
};

export default function manageStudents(state=initialState, action) {
  if (action.type === SET_LOGIN_TYPE) {
    return {
      ...state,
      loginType: action.loginType,
    };
  }
  if (action.type === SET_SECTION_ID) {
    return {
      ...state,
      sectionId: action.sectionId,
    };
  }
  if (action.type === SET_STUDENTS) {
    return {
      ...state,
      studentData: action.studentData,
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
        }
      },
      editingData: _.omit(state.editingData, action.studentId),
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
      studentData: _.omit(state.studentData, studentId)
    };
  }

  return state;
}

// Converts data from /v2/sections/sectionid/students to a set of key/value
// objects for the redux store
export const convertStudentServerData = (studentData, loginType, sectionId) => {
  let studentLookup = {};
  for (let i=0; i < studentData.length; i++) {
    let student = studentData[i];
    studentLookup[student.id] = {
      id: student.id,
      name: student.name,
      username: student.username,
      age: student.age,
      gender: student.gender,
      secretWords: student.secret_words,
      secretPicturePath: student.secret_picture_path,
      loginType: loginType,
      sectionId: sectionId,
      isEditing: false,
    };
  }
  return studentLookup;
};

// Converts key/value id/student pairs to an array of student objects for the
// component to display
// TODO(caleybrock): memoize this - sections could be a few thousand students
export const convertStudentDataToArray = (studentData) => {
  return Object.values(studentData);
};

// Make a post request to edit a student.
const updateStudentOnServer = (updatedStudentInfo, onComplete) => {
  const dataToUpdate = {
    id: updatedStudentInfo.id,
    name: updatedStudentInfo.name,
    age: updatedStudentInfo.age,
    gender: updatedStudentInfo.gender,
  };
  $.ajax({
    url: `/v2/students/${dataToUpdate.id}/update`,
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify(dataToUpdate),
  }).done((data) => {
    onComplete(null, data);
  }).fail((jqXhr, status) => {
    onComplete(status, null);
  });
};
