import Immutable from 'immutable';

// Action types
export const SET_SECTIONS = 'stageLock/SET_SECTIONS';
export const SELECT_SECTION = 'stageLock/SELECT_SECTION';

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
  sectionIds: []
});

// Reducer
export default function reducer(state = new SectionData(), action) {
  if (action.type === SET_SECTIONS) {
    const firstSectionId = Object.keys(action.sections)[0];
    return state.merge({
      selectedSection: firstSectionId,
      sectionsLoaded: true,
      sectionIds: Object.keys(action.sections)
    });
  }

  if (action.type === SELECT_SECTION) {
    const sectionId = action.sectionId;
    if (!state.includes(sectionId)) {
      throw new Error(`Unknown sectionId ${sectionId}`);
    }
    return state.set('selectedSection', sectionId);
  }
  return state;
}
