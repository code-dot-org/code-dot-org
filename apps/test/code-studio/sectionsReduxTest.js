import { assert } from 'chai';
import fakeSectionData from './fakeSectionData';

import reducer, {
  setSections,
  selectSection
} from '@cdo/apps/code-studio/sectionsRedux';


const sectionIds = Object.keys(fakeSectionData);
const [section1Id, section2Id] = sectionIds;

describe('reducer tests', () => {
  describe('setSections', () => {
    it('sets section data we receive from the server', () => {
      const initialState = reducer(undefined, {});
      assert.equal(initialState.sectionsLoaded, false);
      assert.equal(initialState.selectedSection, null);

      const action = setSections(fakeSectionData);

      const nextState = reducer(initialState, action);
      assert.equal(nextState.sectionsLoaded, true);
      assert.equal(nextState.selectedSection, section1Id,
        'arbitrarily select the first section as selected');
      assert.deepEqual(nextState.sectionIds, sectionIds);
      assert.deepEqual(nextState.bySection.toJS(), {
        [section1Id]: {
          name: 'My Section'
        },
        [section2Id]: {
          name: 'My Other Section'
        }
      });

    });
  });

  describe('selectSection', () => {
    it('can change the selected section', () => {
      const sectionState = reducer(undefined, setSections(fakeSectionData));

      assert.equal(sectionState.selectedSection, section1Id);

      const action = selectSection(section2Id);
      const nextState = reducer(sectionState, action);
      assert.equal(nextState.selectedSection, section2Id);
    });

    it('fails if we have no sections', () => {
      const initialState = reducer(undefined, {});
      assert.equal(Object.keys(initialState.sectionIds).length, 0);

      const action = selectSection(section1Id);
      assert.throws(() => {
        reducer(initialState, action);
      });
    });

    it('fails if we try selecting a non-existent section', () => {
      const sectionState = reducer(undefined, setSections(fakeSectionData));
      assert(Object.keys(sectionState.sectionIds).length > 0);

      const action = selectSection(99999);
      assert.throws(() => {
        reducer(sectionState, action);
      });
    });
  });
});
