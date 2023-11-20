import {assert} from '../../util/reconfiguredChai';
import unitSelection, {
  setScriptId,
  getSelectedScriptName,
  getSelectedScriptDescription,
  setCoursesWithProgress,
} from '@cdo/apps/redux/unitSelectionRedux';
import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

describe('unitSelectionRedux', () => {
  const initialState = unitSelection(undefined, {});

  it('if no scriptId then defaults to first unit of first course version', () => {
    const action = setCoursesWithProgress(fakeCoursesWithProgress);
    const nextState = unitSelection(initialState, action);
    assert.deepEqual(nextState.scriptId, 2);
  });

  describe('getSelectedScriptName', () => {
    it('returns the script name of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 5,
          coursesWithProgress: fakeCoursesWithProgress,
        },
      };
      assert.equal(getSelectedScriptName(state), 'csd1-2018');
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          coursesWithProgress: fakeCoursesWithProgress,
        },
      };
      assert.equal(getSelectedScriptName(state), null);
    });
  });

  describe('getSelectedScriptDescription', () => {
    it('returns the script description of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 9,
          coursesWithProgress: fakeCoursesWithProgress,
        },
      };
      assert.equal(getSelectedScriptDescription(state), 'Make a flappy game!');
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          coursesWithProgress: fakeCoursesWithProgress,
        },
      };
      assert.equal(getSelectedScriptDescription(state), null);
    });
  });

  describe('setScriptId', () => {
    it('sets the script id', () => {
      const action = setScriptId(130);
      const nextState = unitSelection(initialState, action);
      assert.deepEqual(nextState.scriptId, 130);
    });
  });
});
