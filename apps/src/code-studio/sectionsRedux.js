import Immutable from 'immutable';

// TODO: these probably belong here
import { SET_SECTIONS, SELECT_SECTION } from './stageLockRedux';

const SectionData = Immutable.Record({
  selectedSection: null,
  sectionsLoaded: false,
  sectionIds: []
});

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
