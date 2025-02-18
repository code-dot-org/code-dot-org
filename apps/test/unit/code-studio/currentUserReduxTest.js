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

      expect(nextState.userName).toEqual('Test Person');
    });
  });

  describe('setUserSignedIn', () => {
    it('can update signInState', () => {
      const signedIn = currentUser(initialState, setUserSignedIn(true));
      expect(signedIn.signInState).toEqual(SignInState.SignedIn);

      const signedOut = currentUser(initialState, setUserSignedIn(false));
      expect(signedOut.signInState).toEqual(SignInState.SignedOut);
    });
    it('initially sets signInState to Unknown', () => {
      expect(initialState.signInState).toEqual(SignInState.Unknown);
    });
  });

  describe('setUserRoleInCourse', () => {
    it('can update userRoleInCourse', () => {
      const instructor = currentUser(
        initialState,
        setUserRoleInCourse(CourseRoles.Instructor)
      );
      expect(instructor.userRoleInCourse).toEqual(CourseRoles.Instructor);

      const participant = currentUser(
        initialState,
        setUserRoleInCourse(CourseRoles.Participant)
      );
      expect(participant.userRoleInCourse).toEqual(CourseRoles.Participant);
    });
    it('initially sets userRoleInCourse to Unknown', () => {
      expect(initialState.userRoleInCourse).toEqual(CourseRoles.Unknown);
    });
  });

  describe('setUserType', () => {
    it('can set the current user type', () => {
      const action = setUserType('teacher');
      const nextState = currentUser(initialState, action);

      expect(nextState.userType).toEqual('teacher');
    });
  });

  describe('setCurrentUserHasSeenStandardsReportInfo', () => {
    it('can set the standards info dialog to seen', () => {
      const action = setCurrentUserHasSeenStandardsReportInfo(true);
      const nextState = currentUser(initialState, action);

      expect(nextState.hasSeenStandardsReportInfo).toEqual(true);
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

    expect(nextState.userId).toEqual(1);
    expect(nextState.userName).toEqual('test_user');
    expect(nextState.userType).toEqual('teacher');
  });
});
