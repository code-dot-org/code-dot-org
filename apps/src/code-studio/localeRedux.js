const SET_RTL = 'locale/SET_RTL';
export const setRtl = isRtl => ({ type: SET_RTL, isRtl });

const initialState = {
  isRtl: false
};

export default function locale(state = initialState, action) {
  if (action.type === SET_RTL) {
    return {
      ...state,
      isRtl: action.isRtl
    };
  }
  return state;
}
