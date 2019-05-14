const SHOW_MINIMAL_PROJECT_HEADER = 'header/SHOW_MINIMAL_PROJECT_HEADER';

const initialState = {
  showMinimalProjectHeader: false
};

export default (state = initialState, action) => {
  if (action.type === SHOW_MINIMAL_PROJECT_HEADER) {
    return {
      ...state,
      showMinimalProjectHeader: true
    };
  }

  return state;
};

export const showMinimalProjectHeader = () => ({
  type: SHOW_MINIMAL_PROJECT_HEADER
});
