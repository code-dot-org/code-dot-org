import { assert } from '../../../util/configuredChai';
import sectionProgress, {
  setSection,
  setValidScripts,
  setCurrentView,
  ViewType
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

const fakeSectionData = {
  id: 123,
  students: {
    id: 1,
    name: 'test1'
  }
};

const fakeValidScripts = [
  {
    category: 'category1',
    category_priority: 1,
    id: 456,
    name: 'Script Name',
    position: 23
  }
];

describe('sectionProgressRedux', () => {
  const initialState = sectionProgress(undefined, {});

  describe('setSection', () => {
    it('sets the section data', () => {
      const action = setSection(fakeSectionData);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.section, fakeSectionData);
    });
  });

  describe('setValidScripts', () => {
    it('sets the script data', () => {
      const action = setValidScripts(fakeValidScripts);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts);
    });
  });

  describe('setCurrentView', () => {
    it('sets the current view to summary', () => {
      const action = setCurrentView(ViewType.SUMMARY);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.currentView, ViewType.SUMMARY);
    });

    it('sets the current view to detail', () => {
      const action = setCurrentView(ViewType.DETAIL);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.currentView, ViewType.DETAIL);
    });
  });
});
