import Immutable from 'immutable';
import _ from 'lodash';

// Action types
export const SET_SECTIONS = 'sections/SET_SECTIONS';
export const SELECT_SECTION = 'sections/SELECT_SECTION';

// Action Creators
export const setSections = sections => ({
  type: SET_SECTIONS,
  sections
});

export const selectSection = sectionId => ({
  type: SELECT_SECTION,
  sectionId
});

const SectionData = Immutable.Record({
  selectedSection: null,
  sectionsLoaded: false,
  sectionIds: [],
  bySection: {}
});

// Reducer
export default function reducer(state = new SectionData(), action) {
  if (action.type === SET_SECTIONS) {
    const firstSectionId = Object.keys(action.sections)[0];
    return state.merge({
      selectedSection: firstSectionId,
      sectionsLoaded: true,
      bySection: _.mapValues(action.sections, section => ({
        name: section.section_name
      }))
    // we want sectionIds to be a native array, which is why we dont put them
    // in the merge
    }).set('sectionIds', Object.keys(action.sections));
  }

  if (action.type === SELECT_SECTION) {
    const sectionId = action.sectionId;
    if (!state.sectionIds.includes(sectionId)) {
      throw new Error(`Unknown sectionId ${sectionId}`);
    }
    return state.set('selectedSection', sectionId);
  }
  return state;
}
