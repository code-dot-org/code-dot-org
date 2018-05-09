import { assert } from '../../../util/configuredChai';
import sectionProgress, {
  setSection,
  setValidScripts,
  setCurrentView,
  ViewType,
  setScriptId,
  addScriptData,
  addStudentLevelProgress,
  setLessonOfInterest,
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
    category: 'csp',
    category_priority: 1,
    id: 300,
    name: 'csp1',
    position: 23
  },
  {
    // use a different category to make sure we aren't relying on it to group
    // units within courses.
    category: 'other csp',
    category_priority: 1,
    id: 301,
    name: 'csp2',
    position: 23
  },
  // Include Express Course to use as default if needed
  {
    category: "CS Fundamentals",
    category_priority: 1,
    id: 182,
    name: "Express Course",
    position: 6,
    script_name: "express",
  },
];

const fakeValidCourses = [
  {
    id: 99,
    script_ids: [300, 301]
  }
];

const fakeScriptData789 = {
  id: 789,
  excludeCsfColumnInLegend: false,
  title: 'Title 789',
  path: '/',
  stages: [
    {id: 1, levels: []},
    {id: 2, levels: []},
  ],
};

const fakeScriptData456 = {
  id: 456,
  excludeCsfColumnInLegend: false,
  title: 'Title 456',
  path: '/',
  stages: [
    {id: 3, levels: []},
    {id: 4, levels: []},
  ],
};

const fakeStudentProgress = {
  1: {242: 1001, 243: 1000},
  2: {242: 1000, 243: 1000},
};

const lessonOfInterest = 16;

describe('sectionProgressRedux', () => {
  const initialState = sectionProgress(undefined, {});

  describe('setScriptId', () => {
    it('sets the script id', () => {
      const action = setScriptId(130);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.scriptId, 130);
    });

    it('seting the script id resets the lesson of interest', () => {
      const action = setLessonOfInterest(lessonOfInterest);
      const nextState = sectionProgress(initialState, action);

      const action2 = setScriptId(130);
      const nextState2 = sectionProgress(nextState, action2);
      assert.deepEqual(nextState2.lessonOfInterest, 1);
    });
  });

  describe('setSection', () => {
    it('sets the section data and assigned scriptId', () => {
      const action = setSection(fakeSectionData);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.section, sortedFakeSectionData);
      assert.deepEqual(nextState.scriptId, 300);
    });

    it('resets all non-section data to initial state', () => {
      const action = setSection(fakeSectionData);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.section, sortedFakeSectionData);
      assert.deepEqual(nextState.scriptDataByScript, {});
      assert.deepEqual(nextState.studentLevelProgressByScript, {});
      assert.deepEqual(nextState.levelsByLessonByScript, {});
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

    it('does not override already assigned scriptId', () => {
      const studentScriptIds = [];
      const validCourses = [];
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses);
      const nextState = sectionProgress({
        ...initialState,
        scriptId: 100
      }, action);
      assert.deepEqual(nextState.scriptId, 100);
    });

    it('includes Express Course if nothing assigned and no progress', () => {
      const studentScriptIds = [];
      const validCourses = [];
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts.filter(script => script.name === "Express Course"));
    });

    it('filters validScripts to those included in studentScriptIds', () => {
      const studentScriptIds = [456];
      const validCourses = [];
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts.filter(script => script.id === 456));
    });

    it('includes other course units when filtering validScripts', () => {
      const studentScriptIds = [300];
      const validCourses = fakeValidCourses;
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses);
      const nextState = sectionProgress(initialState, action);
      const expectedScripts = [fakeValidScripts[1], fakeValidScripts[2]];
      assert.deepEqual(expectedScripts, nextState.validScripts);
    });

    it('includes units of the assigned course when filtering validScripts', () => {
      const studentScriptIds = [];
      const validCourses = fakeValidCourses;
      const assignedCourseId = 99;
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses, assignedCourseId);
      const nextState = sectionProgress(initialState, action);
      const expectedScripts = [fakeValidScripts[1], fakeValidScripts[2]];
      assert.deepEqual(expectedScripts, nextState.validScripts);
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

  describe('setLessonOfInterest', () => {
    it('sets the lesson of interest', () => {
      const action = setLessonOfInterest(lessonOfInterest);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.lessonOfInterest, lessonOfInterest);
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

      const action3 = addStudentLevelProgress(132, { 4: {} });
      const nextState3 = sectionProgress(nextState2, action3);
      assert.deepEqual(nextState2.studentLevelProgressByScript[130], fakeStudentProgress);
      assert.deepEqual(nextState3.studentLevelProgressByScript[132], {
        ...fakeStudentProgress,
        3: {},
        4: {},
      });
    });
  });
});
