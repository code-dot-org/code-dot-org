import {makeEnum} from '../utils';

const SET_CURRENT_USER_NAME = 'currentUser/SET_CURRENT_USER_NAME';
const SET_USER_SIGNED_IN = 'currentUser/SET_USER_SIGNED_IN';
const SET_USER_TYPE = 'currentUser/SET_USER_TYPE';
const SET_HAS_SEEN_STANDARDS_REPORT =
  'currentUser/SET_HAS_SEEN_STANDARDS_REPORT';
const SET_INITIAL_DATA = 'currentUser/SET_INITIAL_DATA';

export const SignInState = makeEnum('Unknown', 'SignedIn', 'SignedOut');

// Action creators
export const setCurrentUserName = userName => ({
  type: SET_CURRENT_USER_NAME,
  userName
});
export const setCurrentUserHasSeenStandardsReportInfo = hasSeenStandardsReport => ({
  type: SET_HAS_SEEN_STANDARDS_REPORT,
  hasSeenStandardsReport
});
export const setUserSignedIn = isSignedIn => ({
  type: SET_USER_SIGNED_IN,
  isSignedIn
});
export const setUserType = (userType, under13) => ({
  type: SET_USER_TYPE,
  userType,
  under13
});
export const setInitialData = serverUser => ({
  type: SET_INITIAL_DATA,
  serverUser
});

const initialState = {
  userId: null,
  userName: null,
  userType: 'unknown',
  signInState: SignInState.Unknown,
  hasSeenStandardsReportInfo: false,
  // Setting default under13 value to true to err on the side of caution for age-restricted content
  under13: true
};

export default function currentUser(state = initialState, action) {
  if (action.type === SET_CURRENT_USER_NAME) {
    return {
      ...state,
      userName: action.userName
    };
  }
  if (action.type === SET_HAS_SEEN_STANDARDS_REPORT) {
    return {
      ...state,
      hasSeenStandardsReportInfo: action.hasSeenStandardsReport
    };
  }
  if (action.type === SET_USER_SIGNED_IN) {
    return {
      ...state,
      signInState: action.isSignedIn
        ? SignInState.SignedIn
        : SignInState.SignedOut
    };
  }
  if (action.type === SET_USER_TYPE) {
    return {
      ...state,
      userType: action.userType,
      under13: action.under13
    };
  }

  if (action.type === SET_INITIAL_DATA) {
    const {id, username, user_type, under_13} = action.serverUser;
    return {
      ...state,
      userId: id,
      userName: username,
      userType: user_type,
      under13: under_13
    };
  }

  return state;
}
