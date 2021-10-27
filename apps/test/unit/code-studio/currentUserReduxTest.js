import {assert} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import currentUser, {
  SignInState,
  setUserSignedIn,
  setUserType,
  setCurrentUserHasSeenStandardsReportInfo,
  setCurrentUserName,
  __testonly__
} from '@cdo/apps/templates/currentUserRedux';

describe('currentUserRedux', () => {
  const initialState = currentUser(undefined, {});

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

  describe('asyncLoadUserData', () => {
    const {currentUserFromServer} = __testonly__;

    it('calls /users/current and sets user data to state', async () => {
      const dispatchSpy = sinon.spy();
      const serverUser = {
        id: 1,
        username: 'test_user',
        user_type: 'teacher',
        is_signed_in: true
      };

      function mockApiResponse() {
        return new window.Response(JSON.stringify(serverUser), {
          status: 200,
          headers: {'Content-type': 'application/json'}
        });
      }

      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub
        .withArgs('/api/v1/users/current')
        .returns(Promise.resolve(mockApiResponse()));

      await currentUserFromServer(dispatchSpy);

      const dispatchCalls = dispatchSpy.getCalls();
      const action1 = dispatchCalls[0].args[0];
      assert.equal('currentUser/SET_USER_SIGNED_IN', action1.type);
      assert.equal(true, action1.isSignedIn);

      const action2 = dispatchCalls[1].args[0];
      assert.equal('currentUser/SET_INITIAL_DATA', action2.type);
      assert.deepEqual(serverUser, action2.serverUser);
    });
  });
});
