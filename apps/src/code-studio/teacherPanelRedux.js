/**
 * Reducer and actions for teacher panel
 */

import { makeEnum } from '@cdo/apps/utils';

export const ViewType = makeEnum('Student', 'Teacher');

// Action types
const SET_VIEW_TYPE = 'teacherPanel/SET_VIEW_TYPE';
const SET_SECTIONS = 'teacherPanel/SET_SECTIONS';
const SELECT_SECTION = 'teacherPanel/SELECT_SECTION';

const initialState = {
  viewAs: ViewType.Teacher,
  sections: {},
  selectedSection: 'none'
};

/**
 * Teacher panel reducer
 */
export default function reducer(state = initialState, action) {
  if (action.type === SET_VIEW_TYPE) {
    return Object.assign({}, state, {
      viewAs: action.viewAs
    });
  }

  if (action.type === SET_SECTIONS) {
    return Object.assign({}, state, {
      sections: action.sections
    });
  }

  if (action.type === SELECT_SECTION) {
    const sectionId = action.sectionId;
    if (!state.sections[sectionId]) {
      throw new Error(`Unknown sectionId ${sectionId}`);
    }
    return Object.assign({}, state, {
      selectedSection: sectionId
    });
  }

  return state;
}

// Action creators
export const setViewType = viewType => {
  if (!ViewType[viewType]) {
    throw new Error('unknown ViewType: ' + viewType);
  }

  return {
    type: SET_VIEW_TYPE,
    viewAs: viewType
  };
};

export const setSections = sections => ({
  type: SET_SECTIONS,
  sections
});

export const selectSection = sectionId => ({
  type: SELECT_SECTION,
  sectionId
});
