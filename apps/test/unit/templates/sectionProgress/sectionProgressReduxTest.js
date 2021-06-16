import {assert, expect} from '../../../util/reconfiguredChai';
import sectionProgress, {
  setCurrentView,
  addDataByUnit,
  setLessonOfInterest,
  startLoadingProgress,
  finishLoadingProgress,
  getCurrentUnitData,
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

const fakeUnitData789 = {
  unitDataByUnit: {
    [789]: {
      id: 789,
      csf: true,
      hasStandards: false,
      title: 'Title 789',
      path: '/',
      lessons: [{id: 1, levels: []}, {id: 2, levels: []}],
      family_name: 'fakeUnit789',
      version_year: 2020
    }
  }
};

const fakeUnitData456 = {
  unitDataByUnit: {
    [456]: {
      id: 456,
      csf: true,
      hasStandards: false,
      title: 'Title 456',
      path: '/',
      lessons: [{id: 3, levels: []}, {id: 4, levels: []}],
      family_name: 'fakeUnit456',
      version_year: 2020
    }
  }
};

const lessonOfInterest = 16;

describe('sectionProgressRedux', () => {
  const initialState = sectionProgress(undefined, {});

  describe('setScriptId', () => {
    it('setting the unit id resets the lesson of interest', () => {
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
      assert.deepEqual(nextState.unitDataByUnit, {});
      assert.deepEqual(nextState.studentLevelProgressByUnit, {});
      assert.deepEqual(nextState.studentLastUpdateByUnit, {});
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

  describe('addDataByUnit', () => {
    it('adds multiple scriptData info', () => {
      const action = addDataByUnit(fakeUnitData456);
      const nextState = sectionProgress(initialState, action);
      const expected456 = fakeUnitData456.unitDataByUnit[456];
      assert.deepEqual(nextState.unitDataByUnit[456], expected456);

      const action2 = addDataByUnit(fakeUnitData789);
      const nextState2 = sectionProgress(nextState, action2);
      const expected789 = fakeUnitData789.unitDataByUnit[789];
      assert.deepEqual(nextState2.unitDataByUnit[456], expected456);
      assert.deepEqual(nextState2.unitDataByUnit[789], expected789);
    });
  });

  describe('setLessonOfInterest', () => {
    it('sets the lesson of interest', () => {
      const action = setLessonOfInterest(lessonOfInterest);
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.lessonOfInterest, lessonOfInterest);
    });
  });

  describe('getCurrentUnitData', () => {
    it('gets the unit data for the section in the selected unit', () => {
      const stateWithUnit = {
        scriptSelection: {scriptId: 123},
        sectionProgress: {
          unitDataByUnit: {
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
      expect(getCurrentUnitData(stateWithUnit)).to.deep.equal({
        lessons: [
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
