import {assert} from '../../util/reconfiguredChai';
import unitSelection, {
  setScriptId,
  getSelectedScriptName,
  getSelectedScriptDescription,
  setCourseVersionsWithProgress
} from '@cdo/apps/redux/unitSelectionRedux';
import {fakeCourseVersionsWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

describe('unitSelectionRedux', () => {
  const initialState = unitSelection(undefined, {});

  it('if no scriptId then defaults to first unit of first course version', () => {
    const action = setCourseVersionsWithProgress(
      fakeCourseVersionsWithProgress
    );
    const nextState = unitSelection(initialState, action);
    assert.deepEqual(nextState.scriptId, '1');
  });

  describe('getSelectedScriptName', () => {
    it('returns the script name of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 9,
          courseVersionsWithProgress: fakeCourseVersionsWithProgress
        }
      };
      assert.equal(getSelectedScriptName(state), 'flappy');
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          courseVersionsWithProgress: fakeCourseVersionsWithProgress
        }
      };
      assert.equal(getSelectedScriptName(state), null);
    });
  });

  describe('getSelectedScriptDescription', () => {
    it('returns the script description of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 9,
          courseVersionsWithProgress: fakeCourseVersionsWithProgress
        }
      };
      assert.equal(getSelectedScriptDescription(state), 'Make a flappy game!');
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          courseVersionsWithProgress: fakeCourseVersionsWithProgress
        }
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
