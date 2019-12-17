import {assert} from '../../../util/deprecatedChai';
import stats, {
  setCompletedLevelCount
} from '@cdo/apps/templates/teacherDashboard/statsRedux';

// Key-value pairs where the key is the student id and value is
// the count of completed levels for that student.
const completedLevelCountByStudentId = {
  2: 111,
  5: 22
};

describe('statsRedux', () => {
  const initialState = stats(undefined, {});

  describe('setCompletedLevelCount', () => {
    it('sets completedLevelCountBySectionId', () => {
      const action = setCompletedLevelCount(
        123,
        completedLevelCountByStudentId
      );
      const nextState = stats(initialState, action);
      const expectedState = {
        123: completedLevelCountByStudentId
      };

      assert.deepEqual(nextState.completedLevelCountBySectionId, expectedState);
    });

    it('sets completedLevelCountBySectionId for multiple sections', () => {
      const moreCompletedLevelCountByStudentId = {
        6: 70,
        1: 100
      };
      const firstAction = setCompletedLevelCount(
        123,
        completedLevelCountByStudentId
      );
      const firstState = stats(initialState, firstAction);
      const secondAction = setCompletedLevelCount(
        321,
        moreCompletedLevelCountByStudentId
      );
      const secondState = stats(firstState, secondAction);
      const expectedState = {
        123: completedLevelCountByStudentId,
        321: moreCompletedLevelCountByStudentId
      };

      assert.deepEqual(
        secondState.completedLevelCountBySectionId,
        expectedState
      );
    });
  });
});
