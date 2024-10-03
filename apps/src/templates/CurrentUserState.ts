/** TODO: Merge these with currentUserRedux when it has been updated to TypeScript/redux-toolkit **/

enum CourseRole {
  Unknown = 'Unknown',
  Instructor = 'Instructor',
  Participant = 'Participant',
}

enum SignInState {
  Unknown = 'Unknown',
  SignedIn = 'SignedIn',
  SignedOut = 'SignedOut',
}

export interface CurrentUserState {
  userId: number;
  userName: string;
  userType: 'unknown' | 'teacher' | 'student';
  userRoleInCourse: CourseRole;
  signInState: SignInState;
  hasSeenStandardsReportInfo: boolean;
  isBackgroundMusicMuted: boolean;
  isSortedByFamilyName: boolean;
  under13: boolean;
  over21: boolean;
  isTeacher: boolean | undefined;
  showProgressTableV2: boolean;
  progressTableV2ClosedBeta: boolean;
  childAccountComplianceState: string | null;
  inSection: boolean | null;
  usStateCode: string | null;
}
