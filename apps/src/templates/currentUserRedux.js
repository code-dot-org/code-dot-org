const SET_CURRENT_USER_ID = 'currentUser/SET_CURRENT_USER_ID';

// Action creators
export const setCurrentUserId = userId => ({type: SET_CURRENT_USER_ID, userId});

const initialState = {
  userId: null
};

export default function currentUser(state = initialState, action) {
  if (action.type === SET_CURRENT_USER_ID) {
    return {
      ...state,
      userId: action.userId
    };
  }
  return state;
}
