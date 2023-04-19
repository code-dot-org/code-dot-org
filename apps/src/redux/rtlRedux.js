// Action type constants

const SET_IS_RTL = 'SET_IS_RTL';

// Action creators

export const setIsRtl = isRtl => ({
  type: SET_IS_RTL,
  isRtl
});

// Initial state of rtlRedux
const initialState = {
  isRtl: false
};

export default function reducer(state = initialState, action) {
  if (action.type === SET_IS_RTL) {
    return {
      ...state,
      isRtl: action.isRtl
    };
  }
  return state;
}
