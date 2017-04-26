const SET_RTL = 'isRtl/SET_RTL';
export const setRtl = isRtl => ({ type: SET_RTL, isRtl });

// Dashboard signals whether or not we're in rtl by setting "dir" on the root
// element. In an ideal world, redux would be the source of truth, but we have
// CSS selectors that depend on this DOM state, some of which are used in cases
// where we don't have redux.
// Instead we have the DOM continue to be the source of truth, and set our store
// state accordingly so that components can access this info.

/**
 * This method looks at the DOM and
 */
function isRtlFromDOM() {
  const head = document.getElementsByTagName('head')[0];
  if (head && head.parentElement) {
    const dir = head.parentElement.getAttribute('dir');
    return !!(dir && dir.toLowerCase() === 'rtl');
  } else {
   return false;
  }
}

export const setRtlFromDOM = () => {
  return dispatch => {
    dispatch(setRtl(isRtlFromDOM()));
  };
};

export default function locale(state = false, action) {
  if (action.type === SET_RTL) {
    return action.isRtl;
  }
  return state;
}
