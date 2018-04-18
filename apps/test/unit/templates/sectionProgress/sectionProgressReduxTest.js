import { assert } from '../../../util/configuredChai';
import sectionProgress, {
  setSection,
  setValidScripts,
  setCurrentView,
  ViewType,
  setScriptId,
  addScriptData,
  addStudentLevelProgress,
  startLoadingProgress,
  finishLoadingProgress,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

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

const fakeValidScripts = [
  {
    category: 'category1',
    category_priority: 1,
    id: 456,
    name: 'Script Name',
    position: 23
  },
  {
    category: 'category1',
    category_priority: 1,
    id: 300,
    name: 'csp2',
    position: 23
  }
];

const fakeScriptData789 = {
  id: 789,
  stages: [
    {id: 1, levels: []},
    {id: 2, levels: []},
  ],
};

const fakeScriptData456 = {
  id: 456,
  stages: [
    {id: 3, levels: []},
    {id: 4, levels: []},
  ],
};

const fakeStudentProgress = {
  1: {242: 1001, 243: 1000},
  2: {242: 1000, 243: 1000},
};

describe('sectionProgressRedux', () => {
  const initialState = sectionProgress(undefined, {});

  describe('setScriptId', () => {
    it('sets the script id', () => {
      const action = setScriptId(130);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.scriptId, 130);
    });
  });

  describe('setSection', () => {
    it('sets the section data and assigned scriptId', () => {
      const action = setSection(fakeSectionData);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.section, sortedFakeSectionData);
      assert.deepEqual(nextState.scriptId, 300);
    });

    it('sets the section data with no default scriptId', () => {
      const sectionDataWithNoScript = {
        ...fakeSectionData,
        script: null,
      };
      const action = setSection(sectionDataWithNoScript);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.section, {...sortedFakeSectionData, script: null});
      assert.deepEqual(nextState.scriptId, null);
    });
  });

  describe('isLoadingProgress', () => {
    it('startLoadingProgress sets isLoadingProgress to true', () => {
      const nextState = sectionProgress(initialState, startLoadingProgress());
      assert.deepEqual(nextState.isLoadingProgress, true);
    });

    it('finishLoadingProgress sets isLoadingProgress to false', () => {
      const nextState = sectionProgress({isLoadingProgress: true}, finishLoadingProgress());
      assert.deepEqual(nextState.isLoadingProgress, false);
    });
  });

  describe('setValidScripts', () => {
    it('sets the script data and defaults scriptId', () => {
      const action = setValidScripts(fakeValidScripts);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts);
      assert.deepEqual(nextState.scriptId, fakeValidScripts[0].id);
    });

    it('sets the script data and does not override already assigned scriptId', () => {
      const action = setValidScripts(fakeValidScripts);
      const nextState = sectionProgress({
        ...initialState,
        scriptId: 100
      }, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts);
      assert.deepEqual(nextState.scriptId, 100);
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

  describe('addScriptData', () => {
    it('adds multiple scriptData info', () => {
      const action = addScriptData(456, fakeScriptData456);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.scriptDataByScript[456], fakeScriptData456);

      const action2 = addScriptData(789, fakeScriptData789);
      const nextState2 = sectionProgress(nextState, action2);
      assert.deepEqual(nextState2.scriptDataByScript[456], fakeScriptData456);
      assert.deepEqual(nextState2.scriptDataByScript[789], fakeScriptData789);
    });
  });

  describe('addStudentLevelProgress', () => {
    it('adds multiple scriptData info', () => {
      const action = addStudentLevelProgress(130, fakeStudentProgress);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.studentLevelProgressByScript[130], fakeStudentProgress);

      const action2 = addStudentLevelProgress(132, {
        ...fakeStudentProgress,
        3: {},
      });
      const nextState2 = sectionProgress(nextState, action2);
      assert.deepEqual(nextState2.studentLevelProgressByScript[130], fakeStudentProgress);
      assert.deepEqual(nextState2.studentLevelProgressByScript[132], {
        ...fakeStudentProgress,
        3: {},
      });
    });
  });
});
