import {makeEnum} from '../utils';

const SET_CURRENT_USER_NAME = 'currentUser/SET_CURRENT_USER_NAME';
const SET_USER_SIGNED_IN = 'currentUser/SET_USER_SIGNED_IN';
const SET_USER_TYPE = 'currentUser/SET_USER_TYPE';
const SET_USER_ROLE_IN_COURSE = 'currentUser/SET_USER_ROLE_IN_COURSE';
const SET_HAS_SEEN_STANDARDS_REPORT =
  'currentUser/SET_HAS_SEEN_STANDARDS_REPORT';
const SET_INITIAL_DATA = 'currentUser/SET_INITIAL_DATA';
const SET_MUTE_MUSIC = 'currentUser/SET_MUTE_MUSIC';

export const SignInState = makeEnum('Unknown', 'SignedIn', 'SignedOut');

export const CourseRoles = makeEnum('Unknown', 'Instructor', 'Participant');

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
export const setUserRoleInCourse = userRoleInCourse => ({
  type: SET_USER_ROLE_IN_COURSE,
  userRoleInCourse
});
export const setInitialData = serverUser => ({
  type: SET_INITIAL_DATA,
  serverUser
});
export const setMuteMusic = isBackgroundMusicMuted => ({
  type: SET_MUTE_MUSIC,
  isBackgroundMusicMuted
});

const initialState = {
  userId: null,
  userName: null,
  userType: 'unknown',
  userRoleInCourse: CourseRoles.Unknown,
  signInState: SignInState.Unknown,
  hasSeenStandardsReportInfo: false,
  isBackgroundMusicMuted: false,
  // Setting default under13 value to true to err on the side of caution for age-restricted content.
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
  if (action.type === SET_USER_ROLE_IN_COURSE) {
    return {
      ...state,
      userRoleInCourse: action.userRoleInCourse
    };
  }
  if (action.type === SET_MUTE_MUSIC) {
    return {
      ...state,
      isBackgroundMusicMuted: action.isBackgroundMusicMuted
    };
  }
  if (action.type === SET_INITIAL_DATA) {
    const {id, username, user_type, mute_music, under_13} = action.serverUser;
    return {
      ...state,
      userId: id,
      userName: username,
      userType: user_type,
      isBackgroundMusicMuted: mute_music,
      under13: under_13
    };
  }

  return state;
}

export const isSignedIn = currentUserState => {
  return currentUserState.signInState === SignInState.SignedIn;
};
