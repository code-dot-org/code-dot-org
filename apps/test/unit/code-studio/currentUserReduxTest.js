import {assert} from '../../util/reconfiguredChai';
import currentUser, {
  SignInState,
  setUserSignedIn,
  setUserType,
  setCurrentUserHasSeenStandardsReportInfo,
  setCurrentUserName,
  setInitialData,
  setUserRoleInCourse,
  CourseRoles,
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

  describe('setUserRoleInCourse', () => {
    it('can update userRoleInCourse', () => {
      const instructor = currentUser(
        initialState,
        setUserRoleInCourse(CourseRoles.Instructor)
      );
      assert.equal(instructor.userRoleInCourse, CourseRoles.Instructor);

      const participant = currentUser(
        initialState,
        setUserRoleInCourse(CourseRoles.Participant)
      );
      assert.equal(participant.userRoleInCourse, CourseRoles.Participant);
    });
    it('initially sets userRoleInCourse to Unknown', () => {
      assert.equal(initialState.userRoleInCourse, CourseRoles.Unknown);
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

  describe('setInitialData', () => {
    const serverUser = {
      id: 1,
      username: 'test_user',
      user_type: 'teacher',
      is_signed_in: true,
    };
    const action = setInitialData(serverUser);
    const nextState = currentUser(initialState, action);

    assert.equal(nextState.userId, 1);
    assert.equal(nextState.userName, 'test_user');
    assert.equal(nextState.userType, 'teacher');
  });
});
