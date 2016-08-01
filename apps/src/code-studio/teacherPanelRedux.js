/**
 * Reducer and actions for teacher panel
 */

import _ from 'lodash';
import { makeEnum } from '@cdo/apps/utils';

export const ViewType = makeEnum('Student', 'Teacher');

// Action types
const SET_VIEW_TYPE = 'teacherPanel/SET_VIEW_TYPE';
const SET_SECTIONS = 'teacherPanel/SET_SECTIONS';
const SELECT_SECTION = 'teacherPanel/SELECT_SECTION';

const initialState = {
  viewAs: ViewType.Teacher,
  sections: {},
  selectedSection: null,
  sectionsLoaded: false,
  unlockedStageIds: []
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
    const sectionId = Object.keys(action.sections)[0];
    const currentSection = action.sections[sectionId];
    return Object.assign({}, state, {
      sections: action.sections,
      sectionsLoaded: true,
      selectedSection: sectionId,
      unlockedStageIds: unlockedStages(currentSection)
    });
  }

  if (action.type === SELECT_SECTION) {
    const sectionId = action.sectionId;
    if (!state.sections[sectionId]) {
      throw new Error(`Unknown sectionId ${sectionId}`);
    }
    const currentSection = state.sections[sectionId];
    return Object.assign({}, state, {
      selectedSection: sectionId,
      unlockedStageIds: unlockedStages(currentSection)
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

// Helpers
const unlockedStages = (section) => {
  console.log(section);
  return _.toPairs(section.stages).filter(([stageId, students]) => {
    return students.some(student => !student.locked);
  }).map(([stageId, stage]) => parseInt(stageId, 10));
};
