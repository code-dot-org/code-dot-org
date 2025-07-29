import unitSelection, {
  setUnit,
  getSelectedUnitName,
  getSelectedUnitPosition,
  getSelectedScriptDescription,
  setCoursesWithProgress,
  getSelectedCourseId,
} from '@cdo/apps/redux/unitSelectionRedux';
import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

describe('unitSelectionRedux', () => {
  const initialState = unitSelection(undefined, {});

  it('if no scriptId then defaults to first unit of first course version', () => {
    const action = setCoursesWithProgress(fakeCoursesWithProgress);
    const nextState = unitSelection(initialState, action);
    expect(nextState.scriptId).toEqual(2);
    expect(nextState.courseVersionId).toEqual(1);
  });

  describe('getSelectedUnitName', () => {
    describe('with no section selected', () => {
      it('returns the script name of the selected script', () => {
        const state = {
          unitSelection: {
            scriptId: 5,
            courseVersionId: 2,
            coursesWithProgress: fakeCoursesWithProgress,
          },
        };
        expect(getSelectedUnitName(state)).toEqual('csd1-2018');
      });

      it('returns null if no script is selected', () => {
        const state = {
          unitSelection: {
            scriptId: null,
            coursesWithProgress: fakeCoursesWithProgress,
          },
        };
        expect(getSelectedUnitName(state)).toBeNull();
      });
    });

    describe('with section selected', () => {
      it('returns the script name of the selected script', () => {
        const state = {
          unitSelection: {
            scriptId: 5,
            courseVersionId: 2,
            coursesWithProgress: fakeCoursesWithProgress,
          },
          teacherSections: {
            selectedSectionId: 99,
            sections: {
              99: {
                courseVersionId: 2,
              },
            },
          },
        };
        expect(getSelectedUnitName(state)).toEqual('csd1-2018');
      });
    });
  });

  describe('getSelectedScriptDescription', () => {
    it('returns the script description of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 9,
          courseVersionId: 3,
          coursesWithProgress: fakeCoursesWithProgress,
        },
      };
      expect(getSelectedScriptDescription(state)).toEqual(
        'Make a flappy game!'
      );
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          coursesWithProgress: fakeCoursesWithProgress,
        },
      };
      expect(getSelectedScriptDescription(state)).toEqual(null);
    });
  });

  describe('getSelectedUnitPosition', () => {
    describe('with no section selected', () => {
      it('returns the script name of the selected script', () => {
        const state = {
          unitSelection: {
            scriptId: 5,
            courseVersionId: 2,
            coursesWithProgress: fakeCoursesWithProgress,
          },
        };
        expect(getSelectedUnitPosition(state)).toEqual(1);
      });

      it('returns null if no script is selected', () => {
        const state = {
          unitSelection: {
            scriptId: null,
            coursesWithProgress: fakeCoursesWithProgress,
          },
        };
        expect(getSelectedUnitPosition(state)).toBeNull();
      });
    });

    describe('with section selected', () => {
      it('returns the script name of the selected script', () => {
        const state = {
          unitSelection: {
            scriptId: 5,
            courseVersionId: 2,
            coursesWithProgress: fakeCoursesWithProgress,
          },
          teacherSections: {
            selectedSectionId: 99,
            sections: {
              99: {
                courseVersionId: 2,
              },
            },
          },
        };
        expect(getSelectedUnitPosition(state)).toEqual(1);
      });
    });
  });

  describe('getSelectedCourseId', () => {
    describe('with no section selected', () => {
      it('returns the course id of the selected script', () => {
        const state = {
          unitSelection: {
            scriptId: 2,
            courseVersionId: 1,
            coursesWithProgress: fakeCoursesWithProgress,
          },
        };
        expect(getSelectedCourseId(state)).toEqual(4);
      });

      it('returns null if no script is selected', () => {
        const state = {
          unitSelection: {
            scriptId: null,
            coursesWithProgress: fakeCoursesWithProgress,
          },
        };
        expect(getSelectedCourseId(state)).toBeNull();
      });
    });

    describe('with section selected', () => {
      it('returns the course id of the selected script', () => {
        const state = {
          unitSelection: {
            scriptId: 2,
            courseVersionId: 1,
            coursesWithProgress: fakeCoursesWithProgress,
          },
          teacherSections: {
            selectedSectionId: 99,
            sections: {
              99: {
                courseVersionId: 2,
              },
            },
          },
        };
        expect(getSelectedCourseId(state)).toEqual(4);
      });
    });
  });

  describe('setUnit', () => {
    it('sets the Unit', () => {
      const action = setUnit(130, 999);
      const nextState = unitSelection(initialState, action);
      expect(nextState.scriptId).toEqual(130);
      expect(nextState.courseVersionId).toEqual(999);
    });
  });
});
