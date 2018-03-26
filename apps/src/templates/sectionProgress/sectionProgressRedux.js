const SET_SECTION = 'sectionProgress/SET_SECTION';
const SET_VALID_SCRIPTS = 'sectionProgress/SET_VALID_SCRIPTS';

export const setSection = section => ({ type: SET_SECTION, section });
export const setValidScripts = validScripts => ({ type: SET_VALID_SCRIPTS, validScripts });

const initialState = {
  section: {},
  validScripts: [],
};

export default function sectionProgress(state=initialState, action) {
  if (action.type === SET_SECTION) {
    return {
      ...state,
      section: action.section
    };
  }
  if (action.type === SET_VALID_SCRIPTS) {
    return {
      ...state,
      validScripts: action.validScripts
    };
  }

  return state;
}
