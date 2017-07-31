import Immutable from 'immutable';
import _ from 'lodash';

export const NO_SECTION = '';

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
  selectedSectionId: NO_SECTION,
  sectionsAreLoaded: false,
  sectionIds: [],
  nameById: {}
});

// Reducer
export default function reducer(state = new SectionData(), action) {
  if (action.type === SET_SECTIONS) {
    let selectedSectionId = state.selectedSectionId;
    // If we have only one section, autoselect it
    if (Object.keys(action.sections).length === 1) {
      selectedSectionId = Object.keys(action.sections)[0];
    }
    return state.merge({
      sectionsAreLoaded: true,
      nameById: _.mapValues(action.sections, section => section.section_name),
      selectedSectionId: selectedSectionId
    // we want sectionIds to be a native array, which is why we dont put them
    // in the merge
    }).set('sectionIds', Object.keys(action.sections));
  }

  if (action.type === SELECT_SECTION) {
    const sectionId = action.sectionId;
    if (sectionId !== NO_SECTION && !state.sectionIds.includes(sectionId)) {
      throw new Error(`Unknown sectionId ${sectionId}`);
    }
    return state.set('selectedSectionId', sectionId);
  }
  return state;
}

/**
 * Get the name and id of every section
 */
export const sectionsNameAndId = state => {
  return state.sectionIds.map(id => ({
    id: parseInt(id, 10),
    name: state.nameById.get(id)
  }));
};
