import {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import sectionProgress, {
  setCurrentView,
  addDataByUnit,
  setLessonOfInterest,
  startLoadingProgress,
  finishLoadingProgress,
  getCurrentUnitData,
  startRefreshingProgress,
  finishRefreshingProgress,
  expandMetadataForStudents,
  collapseMetadataForStudents,
  toggleExpandedChoiceLevel,
  addExpandedLesson,
  removeExpandedLesson,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

const fakeUnitData789 = {
  unitDataByUnit: {
    [789]: {
      id: 789,
      csf: true,
      hasStandards: false,
      title: 'Title 789',
      path: '/',
      lessons: [
        {id: 1, levels: []},
        {id: 2, levels: []},
      ],
      family_name: 'fakeUnit789',
      version_year: 2020,
    },
  },
};

const fakeUnitData456 = {
  unitDataByUnit: {
    [456]: {
      id: 456,
      csf: true,
      hasStandards: false,
      title: 'Title 456',
      path: '/',
      lessons: [
        {id: 3, levels: []},
        {id: 4, levels: []},
      ],
      family_name: 'fakeUnit456',
      version_year: 2020,
    },
  },
};

const lessonOfInterest = 16;

describe('sectionProgressRedux', () => {
  const initialState = sectionProgress(undefined, {});

  describe('setScriptId', () => {
    it('setting the unit id resets the lesson of interest', () => {
      const action = setLessonOfInterest(lessonOfInterest);
      const nextState = sectionProgress(initialState, action);

      // This action is from unitSelectionRedux but affects sectionProgress
      const action2 = setScriptId(130);
      const nextState2 = sectionProgress(nextState, action2);
      expect(nextState2.lessonOfInterest).toEqual(1);
    });
  });

  describe('isLoadingProgress', () => {
    it('startLoadingProgress sets isLoadingProgress to true', () => {
      const nextState = sectionProgress(initialState, startLoadingProgress());
      expect(nextState.isLoadingProgress).toEqual(true);
    });

    it('finishLoadingProgress sets isLoadingProgress to false', () => {
      const nextState = sectionProgress(
        {isLoadingProgress: true},
        finishLoadingProgress()
      );
      expect(nextState.isLoadingProgress).toEqual(false);
    });
  });

  describe('isRefreshingProgress', () => {
    it('startRefreshingProgress sets isRefreshingProgress to true', () => {
      const nextState = sectionProgress(
        initialState,
        startRefreshingProgress()
      );
      expect(nextState.isRefreshingProgress).toEqual(true);
    });

    it('finishRefreshingProgress sets isRefreshingProgress to false', () => {
      const nextState = sectionProgress(
        {isLoadingProgress: true},
        finishRefreshingProgress()
      );
      expect(nextState.isRefreshingProgress).toEqual(false);
    });
  });

  describe('setCurrentView', () => {
    it('sets the current view to summary', () => {
      const action = setCurrentView(ViewType.SUMMARY);
      const nextState = sectionProgress(initialState, action);
      expect(nextState.currentView).toEqual(ViewType.SUMMARY);
    });

    it('sets the current view to detail', () => {
      const action = setCurrentView(ViewType.DETAIL);
      const nextState = sectionProgress(initialState, action);
      expect(nextState.currentView).toEqual(ViewType.DETAIL);
    });
  });

  describe('addDataByUnit', () => {
    it('adds multiple scriptData info', () => {
      const action = addDataByUnit(fakeUnitData456);
      const nextState = sectionProgress(initialState, action);
      const expected456 = fakeUnitData456.unitDataByUnit[456];
      expect(nextState.unitDataByUnit[456]).toEqual(expected456);

      const action2 = addDataByUnit(fakeUnitData789);
      const nextState2 = sectionProgress(nextState, action2);
      const expected789 = fakeUnitData789.unitDataByUnit[789];
      expect(nextState2.unitDataByUnit[456]).toEqual(expected456);
      expect(nextState2.unitDataByUnit[789]).toEqual(expected789);
    });
  });

  describe('setLessonOfInterest', () => {
    it('sets the lesson of interest', () => {
      const action = setLessonOfInterest(lessonOfInterest);
      const nextState = sectionProgress(initialState, action);
      expect(nextState.lessonOfInterest).toEqual(lessonOfInterest);
    });
  });

  describe('getCurrentUnitData', () => {
    it('gets the unit data for the section in the selected unit', () => {
      const stateWithUnit = {
        unitSelection: {scriptId: 123},
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
                      sublevels: [],
                    },
                  ],
                },
              ],
            },
            456: {},
          },
        },
      };
      expect(getCurrentUnitData(stateWithUnit)).toEqual({
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
                sublevels: [],
              },
            ],
          },
        ],
      });
    });
  });

  describe('expandedMetadataStudentIds', () => {
    it('Adds student ids', () => {
      const action = expandMetadataForStudents([1, 2]);
      const nextState = sectionProgress(initialState, action);
      expect(nextState.expandedMetadataStudentIds).toEqual([1, 2]);
    });
    it('No duplicates', () => {
      const action = expandMetadataForStudents([1, 2]);
      const intermediateState = sectionProgress(initialState, action);

      const nextState = sectionProgress(intermediateState, action);
      expect(nextState.expandedMetadataStudentIds).toEqual([1, 2]);
    });
    it('Removes ids', () => {
      const addAction = expandMetadataForStudents([1, 2]);
      const intermediateState = sectionProgress(initialState, addAction);

      const collapseAction = collapseMetadataForStudents([1, 2]);
      const nextState = sectionProgress(intermediateState, collapseAction);
      expect(nextState.expandedMetadataStudentIds).toEqual([]);
    });
  });

  describe('expandedChoiceLevelIds', () => {
    it('Adds level ids', () => {
      const action = toggleExpandedChoiceLevel(1, {
        id: 1,
        sublevels: [1, 2, 3],
      });
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.expandedChoiceLevelIds, [1]);

      const action2 = toggleExpandedChoiceLevel(1, {
        id: 2,
        sublevels: [1, 2, 3],
      });
      const nextState2 = sectionProgress(nextState, action2);
      assert.deepEqual(nextState2.expandedChoiceLevelIds, [1, 2]);
    });

    it('Removes level', () => {
      const action = toggleExpandedChoiceLevel(1, {
        id: 1,
        sublevels: [1, 2, 3],
      });
      const intermediateState = sectionProgress(initialState, action);

      const collapseAction = toggleExpandedChoiceLevel(1, {
        id: 1,
        sublevels: [1, 2, 3],
      });
      const nextState = sectionProgress(intermediateState, collapseAction);
      assert.deepEqual(nextState.expandedChoiceLevelIds, []);
    });

    it('Does not add level without sublevels', () => {
      const action = toggleExpandedChoiceLevel(1, {id: 1});
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.expandedChoiceLevelIds, []);
    });
  });

  describe('expandedLessonIds', () => {
    it('Adds lesson', () => {
      const action = addExpandedLesson(1, 1, {id: 1, levels: [{id: 1}]});
      const nextState = sectionProgress(initialState, action);
      assert.deepEqual(nextState.expandedLessonIds, {1: [1]});
    });

    it('Removes lesson', () => {
      const addAction = addExpandedLesson(1, 1, {id: 1, levels: [{id: 1}]});
      const intermediateState = sectionProgress(initialState, addAction);

      const removeAction = removeExpandedLesson(1, 1, 1);
      const nextState = sectionProgress(intermediateState, removeAction);
      assert.deepEqual(nextState.expandedLessonIds, {1: []});
    });

    it('Does not add duplicate lesson', () => {
      const addAction = addExpandedLesson(1, 1, {id: 1, levels: [{id: 1}]});
      const intermediateState = sectionProgress(initialState, addAction);

      const addAction2 = addExpandedLesson(1, 1, {id: 1, levels: [{id: 1}]});
      const nextState = sectionProgress(intermediateState, addAction2);
      assert.deepEqual(nextState.expandedLessonIds, {1: [1]});
    });

    it('Does not add lockable lesson', () => {
      const addAction = addExpandedLesson(1, 1, {
        id: 1,
        levels: [{id: 1}],
        lockable: true,
      });
      const nextState = sectionProgress(initialState, addAction);
      assert.deepEqual(nextState.expandedLessonIds, {});
    });

    it('Does not add a lesson with no levels', () => {
      const addAction = addExpandedLesson(1, 1, {id: 1});
      const nextState = sectionProgress(initialState, addAction);
      assert.deepEqual(nextState.expandedLessonIds, {});
    });
  });
});
