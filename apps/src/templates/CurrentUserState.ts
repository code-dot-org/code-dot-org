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
  countryCode: string;
  userId: number;
  userName: string;
  displayName?: string;
  userType: 'unknown' | 'teacher' | 'student';
  userRoleInCourse: CourseRole;
  signInState: SignInState;
  hasSeenStandardsReportInfo: boolean;
  isBackgroundMusicMuted: boolean;
  isSortedByFamilyName: boolean;
  under13: boolean;
  over21: boolean;
  isTeacher: boolean | undefined;
  showProgressTableV2: string;
  progressTableV2ClosedBeta: boolean;
  childAccountComplianceState: string | null;
  inSection: boolean | null;
  usStateCode: string | null;
  uuid: string;
  isLti: boolean;
  aiDifferentiationEnabled: boolean;
  hasCompletedAiDifferentiationWelcome: boolean;
  userSharingDisabled: boolean;
  hasSeenHomepageWelcome: boolean;
  inUSA: boolean;
}
