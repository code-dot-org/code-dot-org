export const OAuthSectionTypes = {
  GoogleClassroom: 'google_classroom',
  Clever: 'clever',
  MicrosoftClassroom: 'microsoft_classroom',
} as const;

export const SignInStates = {
  Unknown: 'Unknown',
  SignedIn: 'SignedIn',
  SignedOut: 'SignedOut',
} as const;

export const CourseRoles = {
  Unknown: 'Unknown',
  Instructor: 'Instructor',
  Participant: 'Participant',
} as const;

export const UserTypes = {
  Unknown: 'unknown',
  Student: 'student',
  Teacher: 'teacher',
} as const;
