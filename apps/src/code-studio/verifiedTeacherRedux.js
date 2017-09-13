const SET_VERIFIED = 'verifiedTeacher/SET_VERIFIED';
const SET_VERIFIED_RESOURCES = 'verifiedTeacher/SET_VERIFIED_RESOURCES';

export const setVerified = isVerified => ({ type: SET_VERIFIED, isVerified });
export const setVerifiedResources = hasVerifiedResources => ({
  type: SET_VERIFIED_RESOURCES,
  hasVerifiedResources
});

const initialState = {
  isVerified: false,
  // True if a page (course/script) has resources that are only available to
  // verified teachers
  hasVerifiedResources: false,
};

// TODO: tests
export default function verifiedTeacher(state = initialState, action) {
  if (action.type === SET_VERIFIED) {
    return {
      ...state,
      isVerified: action.isVerified
    };
  }

  if (action.type === SET_VERIFIED_RESOURCES) {
    return {
      ...state,
      hasVerifiedResources: state.hasVerifiedResources
    };
  }

  return state;
}
