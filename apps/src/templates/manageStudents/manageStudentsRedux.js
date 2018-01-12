const SET_LOGIN_TYPE = 'teacherDashboard/SET_LOGIN_TYPE';

export const setLoginType = loginType => ({ type: SET_LOGIN_TYPE, loginType });

const initialState = {
  loginType: '',
};

export default function manageStudents(state=initialState, action) {
  if (action.type === SET_LOGIN_TYPE) {
    return {
      ...state,
      loginType: action.loginType
    };
  }

  return state;
}
