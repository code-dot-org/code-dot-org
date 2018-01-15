const SET_LOGIN_TYPE = 'manageStudents/SET_LOGIN_TYPE';
const SET_STUDENTS = 'manageStudents/SET_STUDENTS';
const SET_SECTION_ID = 'manageStudents/SET_SECTION_ID';

export const setLoginType = loginType => ({ type: SET_LOGIN_TYPE, loginType });
export const setSectionId = sectionId => ({ type: SET_SECTION_ID, sectionId});
export const setStudents = studentData => ({ type: SET_STUDENTS, studentData });
export const startEditingStudent = (studentId) => ({ type: startEditingStudent, studentId });

const initialState = {
  loginType: '',
  studentData: {},
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
// TODO: memoize this - sections could be a few thousand students
export const convertStudentDataToArray = (studentData) => {
  let studentDataArray = [];
  for (var id in studentData) {
    studentDataArray.push(studentData[id]);
  }
  return studentDataArray;
};
