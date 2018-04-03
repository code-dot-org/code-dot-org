const SET_SECTION = 'sectionProgress/SET_SECTION';
const SET_VALID_SCRIPTS = 'sectionProgress/SET_VALID_SCRIPTS';
const SET_CURRENT_VIEW = 'sectionProgress/SET_CURRENT_VIEW';

export const setSection = section => ({ type: SET_SECTION, section });
export const setValidScripts = validScripts => ({ type: SET_VALID_SCRIPTS, validScripts });
export const setCurrentView = viewType => ({ type: SET_CURRENT_VIEW, viewType });

// Types of views of the progress tab
export const ViewType = {
  SUMMARY: "summary",
  DETAIL: "detail",
};

const initialState = {
  section: {},
  validScripts: [],
  currentView: ViewType.SUMMARY,
};

export default function sectionProgress(state=initialState, action) {
  if (action.type === SET_CURRENT_VIEW) {
    return {
      ...state,
      currentView: action.viewType
    };
  }
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
