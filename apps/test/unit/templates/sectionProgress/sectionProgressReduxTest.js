import { assert, expect } from '../../../util/configuredChai';
import sectionProgress, {
  setCurrentView,
  ViewType,
  addScriptData,
  addStudentLevelProgress,
  addStudentLevelPairing,
  setLessonOfInterest,
  startLoadingProgress,
  finishLoadingProgress,
  getStudentPairing,
  getStudentLevelResult,
  getCurrentProgress,
  getCurrentScriptData,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
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
    name: 'csp2',
  }
};

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
      assert.deepEqual(nextState.levelsByLessonByScript, {});
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

  describe('addStudentLevelPairing', () => {
    function isValidInput(input) {
      addStudentLevelPairing(130, input);
    }

    function isInvalidInput(input) {
      expect(() => {
        addStudentLevelPairing(130, input);
      }).to.throw(undefined, undefined, `
        Expected input ${JSON.stringify(input)} to be rejected as invalid, but it was accepted`);
    }

    it('no students is valid', () => {
      isValidInput({});
    });

    it('students without progress are valid', () => {
      isValidInput({
        375: {}
      });
    });

    it('students with progress, who did not pair are valid', () => {
      isValidInput({
        377: {
          5336: false
        }
      });
    });

    it('students with progress, who did pair are valid', () => {
      isValidInput({
        377: {
          5336: true,
        },
        378: {
          5336: true,
        }
      });
    });

    it('invalid if contains too many properties', () => {
      isInvalidInput({
        377: {
          5336: {
            status: 'perfect',
            result: 31,
            paired: true
          },
          5337: {
            status: 'perfect',
            result: 31
          }
        }
      });
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

  describe('getStudentPairing', () => {
    it('plucks paired value from object', () => {
      expect(getStudentPairing({
        377: {
          5336: {
            status: 'perfect',
            result: 31,
            paired: true,
          },
          5337: {
            status: 'perfect',
            result: 31,
            paired: false,
          }
        }
      })).to.deep.equal({
        377: {
          5336: true,
          5337: false
        }
      });
    });
  });

  describe('getCurrentProgress', () => {
    it('gets the progress for the current script', () => {
      const stateWithProgress = {
        scriptSelection: {scriptId: 123},
        sectionProgress: {
          studentLevelProgressByScript: {
            123: 'fake progress 1',
            456: 'fake progress 2',
          }
        }
      };
      expect(getCurrentProgress(stateWithProgress)).to.deep.equal('fake progress 1');
    });
  });

  describe('getCurrentScriptData', () => {
    it('gets the script data for the section in the selected script', () => {
      const stateWithScript = {
        scriptSelection: {scriptId: 123},
        sectionProgress: {
          scriptDataByScript: {
            123: {
              stages: [
                {
                  levels: [{
                    url: 'url',
                    name: 'name',
                    progression: 'progression',
                    kind: 'assessment',
                    icon: 'fa-computer',
                    is_concept_level: false,
                    title: 'hello world'
                  }]
                }
              ]
            }
          },
        },
      };
      expect((getCurrentScriptData(stateWithScript))).to.deep.equal({
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
                url: 'url'
              }
            ]
          }
        ]
      });
    });
  });

  describe('getStudentLevelResult', () => {
    it('plucks level result value from object', () => {
      expect(getStudentLevelResult({
        377: {
          5336: {
            status: 'perfect',
            result: 31,
            paired: true,
          },
          5337: {
            status: 'perfect',
            result: 31,
            paired: false,
          }
        }
      })).to.deep.equal({
        377: {
          5336: 31,
          5337: 31
        }
      });
    });
  });
});
