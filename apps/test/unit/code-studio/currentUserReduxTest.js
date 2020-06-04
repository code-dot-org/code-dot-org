import {assert} from '../../util/reconfiguredChai';
import currentUser, {
  setCurrentUserId,
  SignInState,
  setUserSignedIn,
  setUserType,
  setCurrentUserHasSeenStandardsReportInfo,
  setCurrentUserName
} from '@cdo/apps/templates/currentUserRedux';

describe('currentUserRedux', () => {
  const initialState = currentUser(undefined, {});

  describe('setCurrentUserId', () => {
    it('can set the current user id', () => {
      const action = setCurrentUserId(1);
      const nextState = currentUser(initialState, action);

      assert.deepEqual(nextState.userId, 1);
    });
  });
  describe('setCurrentUserName', () => {
    it('can set the current user name', () => {
      const action = setCurrentUserName('Test Person');
      const nextState = currentUser(initialState, action);

      assert.deepEqual(nextState.userName, 'Test Person');
    });
  });
  describe('setUserSignedIn', () => {
    it('can update signInState', () => {
      const signedIn = currentUser(initialState, setUserSignedIn(true));
      assert.equal(signedIn.signInState, SignInState.SignedIn);

      const signedOut = currentUser(initialState, setUserSignedIn(false));
      assert.equal(signedOut.signInState, SignInState.SignedOut);
    });
    it('initially sets signInState to Unknown', () => {
      assert.equal(initialState.signInState, SignInState.Unknown);
    });
  });
  describe('setUserType', () => {
    it('can set the current user type', () => {
      const action = setUserType('teacher');
      const nextState = currentUser(initialState, action);

      assert.deepEqual(nextState.userType, 'teacher');
    });
  });
  describe('setCurrentUserHasSeenStandardsReportInfo', () => {
    it('can set the standards info dialog to seen', () => {
      const action = setCurrentUserHasSeenStandardsReportInfo(true);
      const nextState = currentUser(initialState, action);

      assert.deepEqual(nextState.hasSeenStandardsReportInfo, true);
    });
  });
});
