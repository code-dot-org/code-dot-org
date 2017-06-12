const SET_VALID_LOGIN_TYPES = 'teacherDashboard/SET_VALID_LOGIN_TYPES';
const SET_VALID_GRADES = 'teacherDashboard/SET_VALID_GRADES';
const SET_VALID_COURSES = 'teacherDashboard/SET_VALID_COURSES';
const SET_VALID_SCRIPTS = 'teacherDashboard/SET_VALID_SCRIPTS';

export const setValidLoginTypes = loginTypes => ({ type: SET_VALID_LOGIN_TYPES, loginTypes });
export const setValidGrades = grades => ({ type: SET_VALID_GRADES, grades });
export const setValidCourses = courses => ({ type: SET_VALID_COURSES, courses });
export const setValidScripts = scripts => ({ type: SET_VALID_SCRIPTS, scripts });

const initialState = {
  validLoginTypes: [],
  validGrades: [],
  validCourses: [],
  validScripts: [],
  sections: []
};

export default function teacherSections(state=initialState, action) {
  if (action.type === SET_VALID_LOGIN_TYPES) {
    return {
      ...state,
      validLoginTypes: action.loginTypes
    };
  }

  if (action.type === SET_VALID_GRADES) {
    return {
      ...state,
      validGrades: action.grades
    };
  }

  if (action.type === SET_VALID_COURSES) {
    return {
      ...state,
      validCourses: action.courses
    };
  }

  if (action.type === SET_VALID_SCRIPTS) {
    return {
      ...state,
      validScripts: action.scripts
    };
  }

  return state;
}
