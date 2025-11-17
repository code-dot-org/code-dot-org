import currentUser, {
  SignInState,
  setUserSignedIn,
  setUserType,
  setCurrentUserHasSeenStandardsReportInfo,
  setShowAITALessonSummary,
  setHasCompletedPersonalizationQuiz,
  setAudioSummaryTranscript,
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

  describe('setShowAITALessonSummary', () => {
    it('can set if a user can see the AI TA lesson summary tool', () => {
      const action = setShowAITALessonSummary(true);
      const nextState = currentUser(initialState, action);

      expect(nextState.showAITALessonSummary).toEqual(true);
    });
  });

  describe('setHasCompletedPersonalizationQuiz', () => {
    it('can set if the user has completed their personalization quiz', () => {
      const action = setHasCompletedPersonalizationQuiz(true);
      const nextState = currentUser(initialState, action);

      expect(nextState.hasCompletedPersonalizationQuiz).toEqual(true);
    });
  });

  describe('setAudioSummaryTranscript', () => {
    it('can set the users lesson summary transcript', () => {
      const summaryTranscript = [
        {timeStamp: '00:00', text: 'Sample transcript text.'},
      ];
      const action = setAudioSummaryTranscript(summaryTranscript);
      const nextState = currentUser(initialState, action);

      expect(nextState.audioSummaryTranscript).toEqual(summaryTranscript);
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
