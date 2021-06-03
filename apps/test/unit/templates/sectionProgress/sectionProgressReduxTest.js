import {assert, expect} from '../../../util/reconfiguredChai';
import sectionProgress, {
  setCurrentView,
  addDataByScript,
  setLessonOfInterest,
  startLoadingProgress,
  finishLoadingProgress,
  getCurrentScriptData,
  startRefreshingProgress,
  finishRefreshingProgress
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {setScriptId} from '@cdo/apps/redux/scriptSelectionRedux';
import {setSection} from '@cdo/apps/redux/sectionDataRedux';

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
    name: 'csp2'
  }
};

const fakeScriptData789 = {
  scriptDataByScript: {
    [789]: {
      id: 789,
      csf: true,
      hasStandards: false,
      title: 'Title 789',
      path: '/',
      lessons: [{id: 1, levels: []}, {id: 2, levels: []}],
      family_name: 'fakeScript789',
      version_year: 2020
    }
  }
};

const fakeScriptData456 = {
  scriptDataByScript: {
    [456]: {
      id: 456,
      csf: true,
      hasStandards: false,
      title: 'Title 456',
      path: '/',
      lessons: [{id: 3, levels: []}, {id: 4, levels: []}],
      family_name: 'fakeScript456',
      version_year: 2020
    }
  }
};

const lessonOfInterest = 16;

describe('sectionProgressRedux', () => {
  const initialState = sectionProgress(undefined, {});

  describe('setScriptId', () => {
    it('seting the script id resets the lesson of interest', () => {
      const action = setLessonOfInterest(lessonOfInterest);
      const nextState = sectionProgress(initialState, action);

      // This action is from scriptSelectionRedux but affects sectionProgress
      const action2 = setScriptId(130);
      const nextState2 = sectionProgress(nextState, action2);
      assert.deepEqual(nextState2.lessonOfInterest, 1);
    });
  });

  describe('setSection', () => {
    it('resets all non-section data to initial state', () => {
      const action = setSection(fakeSectionData);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.scriptDataByScript, {});
      assert.deepEqual(nextState.studentLevelProgressByScript, {});
      assert.deepEqual(nextState.studentLastUpdateByScript, {});
    });
  });

  describe('isLoadingProgress', () => {
    it('startLoadingProgress sets isLoadingProgress to true', () => {
      const nextState = sectionProgress(initialState, startLoadingProgress());
      assert.deepEqual(nextState.isLoadingProgress, true);
    });

    it('finishLoadingProgress sets isLoadingProgress to false', () => {
      const nextState = sectionProgress(
        {isLoadingProgress: true},
        finishLoadingProgress()
      );
      assert.deepEqual(nextState.isLoadingProgress, false);
    });
  });

  describe('isRefreshingProgress', () => {
    it('startRefreshingProgress sets isRefreshingProgress to true', () => {
      const nextState = sectionProgress(
        initialState,
        startRefreshingProgress()
      );
      assert.deepEqual(nextState.isRefreshingProgress, true);
    });

    it('finishRefreshingProgress sets isRefreshingProgress to false', () => {
      const nextState = sectionProgress(
        {isLoadingProgress: true},
        finishRefreshingProgress()
      );
      assert.deepEqual(nextState.isRefreshingProgress, false);
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

  describe('addDataByScript', () => {
    it('adds multiple scriptData info', () => {
      const action = addDataByScript(fakeScriptData456);
      const nextState = sectionProgress(initialState, action);
      const expected456 = fakeScriptData456.scriptDataByScript[456];
      assert.deepEqual(nextState.scriptDataByScript[456], expected456);

      const action2 = addDataByScript(fakeScriptData789);
      const nextState2 = sectionProgress(nextState, action2);
      const expected789 = fakeScriptData789.scriptDataByScript[789];
      assert.deepEqual(nextState2.scriptDataByScript[456], expected456);
      assert.deepEqual(nextState2.scriptDataByScript[789], expected789);
    });
  });

  describe('setLessonOfInterest', () => {
    it('sets the lesson of interest', () => {
      const action = setLessonOfInterest(lessonOfInterest);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.lessonOfInterest, lessonOfInterest);
    });
  });

  describe('getCurrentScriptData', () => {
    it('gets the script data for the section in the selected script', () => {
      const stateWithScript = {
        scriptSelection: {scriptId: 123},
        sectionProgress: {
          scriptDataByScript: {
            123: {
              lessons: [
                {
                  levels: [
                    {
                      url: 'url',
                      name: 'name',
                      progression: 'progression',
                      progressionDisplayName: 'progression display name',
                      kind: 'assessment',
                      icon: 'fa-computer',
                      isConceptLevel: false,
                      levelNumber: 'hello world',
                      bonus: false,
                      isUnplugged: false,
                      sublevels: []
                    }
                  ]
                }
              ]
            },
            456: {}
          }
        }
      };
      expect(getCurrentScriptData(stateWithScript)).to.deep.equal({
        stages: [
          {
            levels: [
              {
                icon: 'fa-computer',
                isConceptLevel: false,
                isUnplugged: false,
                kind: 'assessment',
                levelNumber: 'hello world',
                name: 'name',
                progression: 'progression',
                progressionDisplayName: 'progression display name',
                url: 'url',
                bonus: false,
                sublevels: []
              }
            ]
          }
        ]
      });
    });
  });
});
