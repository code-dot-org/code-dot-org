import {makeEnum} from '../utils';

const SET_CURRENT_USER_ID = 'currentUser/SET_CURRENT_USER_ID';
const SET_USER_SIGNED_IN = 'currentUser/SET_USER_SIGNED_IN';
const SET_USER_TYPE = 'currentUser/SET_USER_TYPE';

export const SignInState = makeEnum('Unknown', 'SignedIn', 'SignedOut');

// Action creators
export const setCurrentUserId = userId => ({type: SET_CURRENT_USER_ID, userId});
export const setUserSignedIn = isSignedIn => ({
  type: SET_USER_SIGNED_IN,
  isSignedIn
});
export const setUserType = userType => ({type: SET_USER_TYPE, userType});

const initialState = {
  userId: null,
  userType: 'unknown',
  signInState: SignInState.Unknown
};

export default function currentUser(state = initialState, action) {
  if (action.type === SET_CURRENT_USER_ID) {
    return {
      ...state,
      userId: action.userId
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
  return state;
}
