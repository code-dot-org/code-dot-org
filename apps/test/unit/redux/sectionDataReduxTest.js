import { assert } from '../../util/configuredChai';
import sectionData, {
  setSection,
  CLEAR_SECTION_DATA,
  START_LOADING_SECTION,
  LOAD_SECTION_SUCCESS,
  LOAD_SECTION_FAIL,
  LoadingStatus,
} from '@cdo/apps/redux/sectionDataRedux';

const fakeSectionData = {
  id: 123,
  students: [
    {
      id: 1,
      name: 'studentb'
    },
    {
      id: 2,
      name: 'studenta'
    }
  ],
  script: {
    id: 300,
    name: 'csp2',
  }
};

const sortedFakeSectionData = {
  id: 123,
  students: [
    {
      id: 2,
      name: 'studenta'
    },
    {
      id: 1,
      name: 'studentb'
    },
  ],
  script: {
    id: 300,
    name: 'csp2',
  }
};

describe('sectionDataRedux', () => {
  const initialState = sectionData(undefined, {});

  describe('setSection', () => {
    it('sets the section data', () => {
      const action = setSection(fakeSectionData);
      const nextState = sectionData(initialState, action);
      assert.deepEqual(nextState.section, sortedFakeSectionData);
    });
  });

  describe('clearSectionData', () => {
    it('resets section data redux to initial state', () => {
      const state = { section: sortedFakeSectionData };
      const action = { type: CLEAR_SECTION_DATA };
      const nextState = sectionData(state, action);
      assert.deepEqual(nextState.section, {});
    });
  });

  describe('startLoadingSection', () => {
    it('sets loadingStatus to in progress', () => {
      const state = { section: sortedFakeSectionData };
      const action = { type: START_LOADING_SECTION };
      const nextState = sectionData(state, action);
      assert.equal(nextState.loadingStatus, LoadingStatus.IN_PROGRESS);
      assert.deepEqual(nextState.section, sortedFakeSectionData);
    });
  });

  describe('loadSectionSuccess', () => {
    it('sets loadingStatus to in progress', () => {
      const state = { section: sortedFakeSectionData };
      const action = { type: LOAD_SECTION_SUCCESS };
      const nextState = sectionData(state, action);
      assert.equal(nextState.loadingStatus, LoadingStatus.SUCCESS);
      assert.deepEqual(nextState.section, sortedFakeSectionData);
    });
  });

  describe('loadSectionFail', () => {
    it('sets loadingStatus to in progress', () => {
      const state = { section: sortedFakeSectionData };
      const action = { type: LOAD_SECTION_FAIL };
      const nextState = sectionData(state, action);
      assert.equal(nextState.loadingStatus, LoadingStatus.FAIL);
      assert.deepEqual(nextState.section, sortedFakeSectionData);
    });
  });
});
