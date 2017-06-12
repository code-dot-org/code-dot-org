const SET_VALID_LOGIN_TYPES = 'teacherDashboard/SET_VALID_LOGIN_TYPES';

export const setValidLoginTypes = loginTypes => ({ type: SET_VALID_LOGIN_TYPES, loginTypes });

const initialState = {
  validLoginTypes: [],
  validGrades: [],
  validCourses: [],
  sections: []
};

export default function teacherSections(state=initialState, action) {
  if (action.type === SET_VALID_LOGIN_TYPES) {
    return {
      ...state,
      validLoginTypes: action.loginTypes
    };
  }

  return state;
}
