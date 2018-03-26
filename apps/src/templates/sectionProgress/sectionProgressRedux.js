const SET_SECTION = 'sectionProgress/SET_SECTION';

export const setSection = section => ({ type: SET_SECTION, section });

const initialState = {
  section: {},
};

export default function sectionProgress(state=initialState, action) {
  if (action.type === SET_SECTION) {
    return {
      ...state,
      section: action.section
    };
  }

  return state;
}
