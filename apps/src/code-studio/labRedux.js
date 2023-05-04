const SET_IS_LOADING = 'lab/SET_IS_LOADING';
export const setIsLoading = isLoading => ({
  type: SET_IS_LOADING,
  isLoading,
});

const SET_IS_PAGE_ERROR = 'lab/SET_IS_PAGE_ERROR';
export const setIsPageError = isPageError => ({
  type: SET_IS_PAGE_ERROR,
  isPageError,
});

const initialState = {
  isLoading: false,
  isPageError: false,
};

/**
 * Reducer for lab state.
 */
export default function reducer(state = initialState, action) {
  if (action.type === SET_IS_LOADING) {
    return {...state, isLoading: action.isLoading};
  }
  if (action.type === SET_IS_PAGE_ERROR) {
    // TODO: log this issue.
    return {...state, isPageError: action.isPageError};
  }
  return state;
}
