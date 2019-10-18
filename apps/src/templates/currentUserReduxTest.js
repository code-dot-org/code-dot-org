import {assert} from '../../../util/reconfiguredChai';
import currentUser, {
  setCurrentUserId
} from '@cdo/apps/templates/sectionProgress/currentUserRedux';

describe('currentUserRedux', () => {
  const initialState = currentUser(undefined, {});

  describe('setCurrentUserId', () => {
    it('seting the script id resets the lesson of interest', () => {
      const action = setCurrentUserId(1);
      const nextState = currentUser(initialState, action);

      assert.deepEqual(nextState.userId, 1);
    });
  });
});
