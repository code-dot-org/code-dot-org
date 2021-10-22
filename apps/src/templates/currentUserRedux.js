import {makeEnum} from '../utils';

const SET_CURRENT_USER_ID = 'currentUser/SET_CURRENT_USER_ID';
const SET_CURRENT_USER_NAME = 'currentUser/SET_CURRENT_USER_NAME';
const SET_USER_SIGNED_IN = 'currentUser/SET_USER_SIGNED_IN';
const SET_USER_TYPE = 'currentUser/SET_USER_TYPE';
const SET_HAS_SEEN_STANDARDS_REPORT =
  'currentUser/SET_HAS_SEEN_STANDARDS_REPORT';
const SET_INITIAL_DATA = 'currentUser/SET_INITIAL_DATA';

export const SignInState = makeEnum('Unknown', 'SignedIn', 'SignedOut');

// Action creators
export const setCurrentUserId = userId => ({type: SET_CURRENT_USER_ID, userId});
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
export const setUserType = userType => ({type: SET_USER_TYPE, userType});

const initialState = {
  userId: null,
  userName: null,
  userType: 'unknown',
  signInState: SignInState.Unknown,
  hasSeenStandardsReportInfo: false
};

export default function currentUser(state = initialState, action) {
  if (action.type === SET_CURRENT_USER_ID) {
    return {
      ...state,
      userId: action.userId
    };
  }
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
      userType: action.userType
    };
  }

  if (action.type === SET_INITIAL_DATA) {
    const {id, username, user_type} = action.serverUser;
    return {
      ...state,
      userId: id,
      userName: username,
      userType: user_type
    };
  }

  return state;
}

export const asyncLoadUserData = () => dispatch => {
  $.ajax('/api/v1/users/current_user')
    .done(data => {
      if (!data.is_signed_in) {
        dispatch(setUserSignedIn(false));
      } else {
        dispatch(setUserSignedIn(true));
        dispatch({
          type: SET_INITIAL_DATA,
          serverUser: data
        });
      }
    })
    .fail(err => {
      console.log(err);
    });
};
