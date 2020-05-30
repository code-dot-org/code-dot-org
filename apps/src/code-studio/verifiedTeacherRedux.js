const SET_VERIFIED = 'verifiedTeacher/SET_VERIFIED';
const SET_VERIFIED_RESOURCES = 'verifiedTeacher/SET_VERIFIED_RESOURCES';
const SET_OWNER = 'verifiedTeacher/SET_OWNER';

export const setVerified = () => ({type: SET_VERIFIED});
export const setVerifiedResources = hasVerifiedResources => ({
  type: SET_VERIFIED_RESOURCES
});
export const setOwner = () => ({type: SET_OWNER});

const initialState = {
  isVerified: false,
  // True if a page (course/script) has resources that are only available to
  // verified teachers
  hasVerifiedResources: false,
  isOwner: false
};

export default function verifiedTeacher(state = initialState, action) {
  if (action.type === SET_VERIFIED) {
    return {
      ...state,
      isVerified: true
    };
  }

  if (action.type === SET_VERIFIED_RESOURCES) {
    return {
      ...state,
      hasVerifiedResources: true
    };
  }

  if (action.type === SET_OWNER) {
    return {
      ...state,
      isOwner: true
    };
  }

  return {
    ...state
  };
}
