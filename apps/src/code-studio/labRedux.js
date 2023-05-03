const SET_LOADING = 'lab/SET_LOADING';
export const setLoading = isLoading => ({
  type: SET_LOADING,
  isLoading,
});

const initialState = {
  isLoading: false,
};

/**
 * Reducer for lab state.
 */
export default function reducer(state = initialState, action) {
  if (action.type === SET_LOADING) {
    return {...state, isLoading: action.isLoading};
  }
  return state;
}
