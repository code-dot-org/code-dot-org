const SET_RTL = 'isRtl/SET_RTL';
export const setRtl = isRtl => ({ type: SET_RTL, isRtl });

export default function locale(state = false, action) {
  if (action.type === SET_RTL) {
    return action.isRtl;
  }
  return state;
}
